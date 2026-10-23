import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { getAiConfig, getChatModel, recordAiRuntimeModel } from './aiService.js';
import { buildToolsForUser } from './botToolService.js';

const MAX_TOOL_STEPS = 5;
const GEMINI_MODEL_POOL = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'];
const AUTO_MODEL_COOLDOWN_MS = 5 * 60 * 1000;

const isServiceUnavailable = (error) => /\b503\b|UNAVAILABLE|temporarily unavailable|high demand|overload/i
    .test([error?.message, error?.status, error?.statusText, error?.code].filter(Boolean).join(' '));

const ROLE_LABELS = {
    guest: 'Khách vãng lai',
    admin: 'Quản trị viên (admin)',
    owner: 'Chủ cửa hàng (owner)',
    staff: 'Nhân viên bán hàng (staff)',
    customer: 'Khách hàng (customer)'
};

const ROLE_GUIDE = {
    guest: 'Bạn chỉ hỗ trợ khách hàng tiềm năng: tư vấn và tra cứu sản phẩm, giải đáp chính sách đổi trả/bảo hành, theo dõi đơn (sau khi đăng nhập), lịch sử mua hàng và xin đánh giá sau mua. Hỏi lần lượt nhu cầu sử dụng, danh mục, tầm giá và thương hiệu cần thiết. Khi khách đã xác nhận bản tóm tắt nhu cầu, gọi ghi_nhan_nhu_cau_mua_sam để lưu dữ liệu phân tích cho cửa hàng; không lưu thông tin định danh. Khi khách muốn đặt hàng, hướng dẫn đăng nhập /dangnhap hoặc đăng ký /dangky. Không tự xác nhận đơn; cửa hàng sẽ xử lý trên hệ thống nội bộ. Chỉ chuyển cho nhân viên khi khách yêu cầu hoặc cần hỗ trợ khiếu nại. Không yêu cầu OTP, mật khẩu, CCCD hay dữ liệu tài chính.',
    customer: 'Bạn chỉ hỗ trợ khách hàng: tư vấn và tra cứu sản phẩm, giải đáp chính sách đổi trả/bảo hành, tạo yêu cầu đặt hàng chưa xác nhận, theo dõi đơn, xem lịch sử mua hàng và xin đánh giá sau mua. Hỏi lần lượt nhu cầu sử dụng, danh mục, tầm giá và thương hiệu cần thiết. Khi khách đã xác nhận bản tóm tắt nhu cầu, gọi ghi_nhan_nhu_cau_mua_sam để lưu dữ liệu phân tích cho cửa hàng; không lưu thông tin định danh. Đơn chỉ được xác nhận bởi nhân viên trên hệ thống nội bộ. Chỉ đọc dữ liệu của chính khách này. Nếu đơn đã giao và chưa đánh giá, mời khách chấm điểm; chỉ gọi gui_danh_gia_don_hang khi khách đồng ý rõ ràng. Khi hỏi trả góp, hướng dẫn kênh chính thức; không xin CCCD, mã OTP hay dữ liệu tài chính.',
    staff: 'Bạn hỗ trợ nhân viên tra cứu tồn kho, đơn hàng, lập hóa đơn trả một lần, xác nhận thanh toán đơn khách đặt qua Bot, tạo phiếu đổi trả, xem chấm công. Nhân viên không được xem báo cáo doanh thu và không được duyệt đổi trả.',
    owner: 'Bạn hỗ trợ chủ cửa hàng phân tích doanh thu, sản phẩm bán chạy, tồn kho, đề xuất nhập hàng, lập hóa đơn, xác nhận thanh toán, tạo và duyệt/từ chối phiếu đổi trả.',
    admin: 'Vai trò nội bộ không được hỗ trợ trên Bot khách hàng. Hãy sử dụng hệ thống nội bộ.'
};

const IMAGE_AMOUNT_RULES = `
CHẾ ĐỘ ĐỌC ẢNH HÓA ĐƠN / BIÊN LAI:
- Đọc số tiền gắn với đúng nhãn trên ảnh. Với biên lai chuyển khoản, ưu tiên “Số tiền giao dịch”, “Số tiền chuyển” hoặc “Số tiền thanh toán”; tuyệt đối không lấy số dư, số dư khả dụng, hạn mức, phí, hoặc số tiền của giao dịch khác.
- Với hóa đơn bán hàng, lấy “Tổng thanh toán”, “Khách phải trả”, “Đã thanh toán” hoặc nhãn tương đương. Không lấy đơn giá, thành tiền một dòng, tạm tính, tiền giảm giá hay phí riêng làm tổng hóa đơn.
- Giữ nguyên chuỗi chữ số và dấu phân tách nhìn thấy trước khi chuẩn hóa. Không tự thêm/bớt số 0, không suy ra chữ số bị mờ từ ngữ cảnh và không chuyển đơn vị nghìn/triệu nếu ảnh không ghi rõ.
- Nếu có nhiều trường tiền, nói rõ số tiền nào thuộc nhãn nào. Nếu không đọc chắc được chữ số hoặc nhãn, nói “chưa đọc chắc chắn”, nêu các khả năng nhìn thấy nếu có và đề nghị ảnh rõ/cắt sát vùng số tiền. Không đoán một đáp án duy nhất.
- Chỉ mô tả nội dung ảnh. Không kết luận giao dịch thành công hay xác nhận cửa hàng đã nhận tiền chỉ từ ảnh.
`;

const buildSystemPrompt = (user, hasImage = false) => `${['guest', 'customer'].includes(user.role)
    ? 'Bạn là Bot chăm sóc khách hàng của cửa hàng BanHangAI, nói tiếng Việt thân thiện, lịch sự và ngắn gọn. Xưng "tôi" và gọi khách là "bạn".'
    : 'Bạn là Bot trợ lý nội bộ của hệ thống bán hàng HTH Smart Sales, nói tiếng Việt thân thiện và ngắn gọn.'}
Người đang chat: ${user.full_name || user.username} — vai trò: ${ROLE_LABELS[user.role]}.
${ROLE_GUIDE[user.role]}

QUY TẮC BẮT BUỘC:
1. Chỉ trả lời dựa trên kết quả của công cụ hoặc nội dung đọc được từ ảnh người dùng gửi. Không bịa số liệu, giá, tồn kho; nếu ảnh mờ hoặc công cụ không có dữ liệu, hãy nói rõ.
2. Khi người dùng hỏi tìm/giá/tồn kho hoặc nhắc tên hãng, dòng máy hay mã sản phẩm cụ thể (ví dụ iPhone, Samsung), luôn gọi \`tim_san_pham\` trước khi trả lời. Truyền các từ khóa tên hãng/dòng máy cốt lõi, bỏ câu hỏi thừa; không kết luận không có hàng chỉ từ trí nhớ.
3. Nhân viên/chủ cửa hàng xác nhận đơn khách đặt qua Bot: gọi \`xac_nhan_don_khach\`; đây là xác nhận đơn và phát hành hóa đơn, KHÔNG đồng nghĩa đã nhận tiền. Chỉ dùng \`xac_nhan_thanh_toan_don\` khi nhân viên đã thực sự kiểm tra và nhận tiền.
4. Câu hỏi về chính sách, chức năng hệ thống, cách dùng: gọi công cụ tra_cuu_tri_thuc rồi tóm tắt lại.
5. Công cụ ghi dữ liệu KHÔNG thực hiện ngay: chúng trả về CHO_XAC_NHAN. Với khách hàng, hãy tóm tắt và hướng dẫn họ bấm nút Xác nhận hoặc Hủy trên thẻ thao tác; không dùng lời nhắn hay lệnh chat thay cho xác nhận. Với nhân viên/chủ cửa hàng, giữ luồng xác nhận nội bộ hiện có. Không bao giờ nói là đã thực hiện xong trước khi server xác nhận.
6. Luôn xét các tin nhắn trước đó để hiểu mục tiêu, sở thích, ngân sách, sản phẩm, số lượng và khoảng thời gian người dùng đã nêu. Không hỏi lại điều đã có. Nếu thiếu dữ liệu cần thiết, chỉ hỏi một câu ngắn, cụ thể mỗi lượt để thu thập phần còn thiếu; không đoán.
7. Tiền tệ hiển thị dạng 1.250.000đ. Dùng danh sách gạch đầu dòng, in đậm **như này** cho thông tin quan trọng.
8. Dùng đúng quyền theo vai trò. Nếu thiếu quyền, giải thích giới hạn và nêu bước người dùng tự làm được (ví dụ đăng nhập /dangnhap); không mặc định đẩy sang nhân viên.
9. Chỉ gợi ý lệnh hoặc bước tiếp theo liên quan trực tiếp đến mục tiêu và dữ liệu vừa trao đổi, tối đa ba gợi ý. Không liệt kê toàn bộ chức năng sau mỗi câu trả lời.
10. Chỉ mời gặp nhân viên khi người dùng chủ động yêu cầu, cần xử lý khiếu nại cá nhân, hoặc bot thực sự không thể hoàn tất sau khi đã hỏi làm rõ. Với tư vấn sản phẩm/chính sách, tiếp tục hỗ trợ trong bot.
11. Nếu khách gửi CCCD 12 chữ số trong chat, không lặp lại hoặc xử lý số đó; nhắc khách không gửi CCCD qua chat và hướng dẫn dùng kênh chính thức của đối tác tài chính.
12. Khi nhận ảnh hóa đơn/biên lai, chỉ mô tả thông tin đọc được và nêu phần nào không rõ. Không khẳng định đã nhận tiền hoặc tự xác nhận đơn dựa trên ảnh; nhân viên phải kiểm tra và xác nhận trong hệ thống.
${hasImage ? IMAGE_AMOUNT_RULES : ''}
Hôm nay là ${new Date().toISOString().slice(0, 10)}.`;

const textOf = (content) => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content.map((part) => (typeof part === 'string' ? part : (part?.type === 'text' ? part.text : ''))).join('');
    }
    return '';
};

const toLangChainMessages = (history, attachment) => history.map((entry, index) => {
    if (entry.role !== 'user') return new AIMessage(entry.content);
    if (attachment && index === history.length - 1) {
        const dataUrl = `data:${attachment.mimeType};base64,${attachment.data}`;
        return new HumanMessage([
            { type: 'text', text: entry.content },
            { type: 'image_url', image_url: { url: dataUrl } }
        ]);
    }
    return new HumanMessage(entry.content);
});

/**
 * Vòng lặp tool-calling của LangChain (bindTools) cho từng vai trò; stream từng đoạn văn bản.
 * @param {{user: object, history: Array<{role: string, content: string}>}} params
 */
export async function* runBotAgent({ user, history, attachment = null }) {
    const tools = buildToolsForUser(user);
    const toolsByName = new Map(tools.map((tool) => [tool.name, tool]));
    const config = await getAiConfig();
    const autoMode = config.provider === 'gemini' && config.model_mode === 'auto';
    const alternatives = autoMode ? [...new Set([config.model, ...GEMINI_MODEL_POOL].filter(Boolean))] : [config.model];
    const useStickyModel = autoMode && config.auto_model && config.auto_primary === config.model && config.auto_until > Date.now();
    const modelNames = useStickyModel
        ? [config.auto_model, ...alternatives.filter((name) => name !== config.auto_model)]
        : alternatives;
    const models = [(await getChatModel(useStickyModel && config.auto_model !== config.model ? { model: config.auto_model } : {})).bindTools(tools)];
    let activeModelIndex = 0;
    let runtimeModelRecorded = false;
    const invokeWithFailover = async (messages) => {
        while (true) {
            try {
                const result = await models[activeModelIndex].invoke(messages);
                if (autoMode && activeModelIndex > 0 && !runtimeModelRecorded) {
                    try {
                        await recordAiRuntimeModel(modelNames[activeModelIndex], 'failover', config.model);
                        runtimeModelRecorded = true;
                    } catch (statusError) {
                        console.warn('Could not persist automatic Gemini model selection:', statusError.message);
                    }
                }
                return result;
            } catch (error) {
                if (!isServiceUnavailable(error) || activeModelIndex + 1 >= modelNames.length) throw error;
                activeModelIndex += 1;
                if (!models[activeModelIndex]) {
                    models[activeModelIndex] = (await getChatModel({ model: modelNames[activeModelIndex] })).bindTools(tools);
                }
                console.warn(`Gemini model ${modelNames[activeModelIndex - 1]} unavailable; retrying with ${modelNames[activeModelIndex]}.`);
            }
        }
    };
    const messages = [new SystemMessage(buildSystemPrompt(user, Boolean(attachment))), ...toLangChainMessages(history, attachment)];
    let emittedText = false;

    for (let step = 0; step < MAX_TOOL_STEPS; step += 1) {
        const aggregate = await invokeWithFailover(messages);
        
        const isToolChunk = (aggregate.tool_calls?.length || 0) > 0;
        if (!isToolChunk) {
            const text = textOf(aggregate.content);
            if (text) {
                emittedText = true;
                yield text;
            }
        }

        const calls = aggregate?.tool_calls || [];
        if (!calls.length) {
            if (!emittedText) yield 'Mình chưa có câu trả lời phù hợp. Bạn thử hỏi cách khác hoặc gõ /trogiup nhé.';
            return;
        }

        messages.push(aggregate);
        const results = await Promise.all(calls.map(async (call) => {
            const tool = toolsByName.get(call.name);
            return tool
                ? tool.invoke(call.args)
                : JSON.stringify({ loi: 'Công cụ không tồn tại hoặc bạn không có quyền dùng.' });
        }));
        calls.forEach((call, index) => {
            messages.push(new ToolMessage({ content: String(results[index]), tool_call_id: call.id, name: call.name }));
        });
    }

    yield '\n\nYêu cầu hơi phức tạp nên mình chưa xử lý xong. Bạn hãy chia nhỏ yêu cầu giúp mình nhé.';
}

import axios from 'axios';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzcvdkJvYNF8Q17uaq3gR2MsVgd61mUrtruKgTHCA0LI6W0h7FrwzUEyeqxANb2C_Mmbw/exec';

// Mock data
const MOCK_DATA = [
    {
        code: '2330',
        name: '台積電',
        holdings: '1000',
        cost: '500',
        currentPrice: '550',
        returnRate: '10%',
        strategy: '長期持有',
        warning: '480',
        stopLoss: '450',
        tp1: '600',
        tp2: '650',
        targetPrice: '700',
        notes: '護國神山',
        risk: '低',
        advice: '續抱',
        addPoint: '520'
    },
    {
        code: '00929',
        name: '復華台灣科技優息',
        holdings: '5000',
        cost: '18.5',
        currentPrice: '19.2',
        returnRate: '3.7%',
        strategy: '存股',
        warning: '18',
        stopLoss: '17',
        tp1: '22',
        tp2: '25',
        targetPrice: '28',
        notes: '月配息',
        risk: '中',
        advice: '定期定額',
        addPoint: '不建議加碼'
    }
];

export const getStrategies = async () => {
    if (GOOGLE_SCRIPT_URL.includes('YOUR_DEPLOYED')) {
        console.warn('Using Mock Data (API URL not set)');
        return MOCK_DATA;
    }
    try {
        const response = await axios.get(GOOGLE_SCRIPT_URL);

        // 1. Check if response is strictly the expected JSON structure {status: 'success', data: [...]}
        if (response.data && Array.isArray(response.data.data)) {
            // Optimization: If valid array but empty, show MOCK_DATA
            if (response.data.data.length === 0) {
                console.log('Google Sheet is empty. Showing MOCK_DATA.');
                return MOCK_DATA;
            }
            return response.data.data;
        }

        // 2. If we are here, the response is NOT the expected {data: []}
        // It could be an error HTML string, or a JSON error message.
        console.warn('API returned unexpected format (not an array). Falling back to MOCK_DATA.', response.data);
        return MOCK_DATA;

    } catch (error) {
        console.error('API Error, using mock data:', error);
        return MOCK_DATA;
    }
};

export const saveStrategy = async (strategy) => {
    if (GOOGLE_SCRIPT_URL.includes('YOUR_DEPLOYED')) {
        console.warn('Mock Save:', strategy);
        MOCK_DATA.push(strategy);
        return { status: 'success', message: 'Mock save successful' };
    }

    // Explicit action='create'
    const formData = new URLSearchParams();
    formData.append('action', 'create');
    formData.append('data', JSON.stringify(strategy));

    const response = await axios.post(GOOGLE_SCRIPT_URL, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
};

export const deleteStrategy = async (code) => {
    if (GOOGLE_SCRIPT_URL.includes('YOUR_DEPLOYED')) {
        console.warn('Mock Delete:', code);
        const index = MOCK_DATA.findIndex(item => item.code === code);
        if (index > -1) MOCK_DATA.splice(index, 1);
        return { status: 'success', message: 'Mock delete successful' };
    }
    // GAS requires POST for side-effects usually, usually we send action='delete'
    const formData = new URLSearchParams();
    formData.append('action', 'delete');
    formData.append('code', code);

    const response = await axios.post(GOOGLE_SCRIPT_URL, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
};

export const updateStrategy = async (strategy) => {
    if (GOOGLE_SCRIPT_URL.includes('YOUR_DEPLOYED')) {
        console.warn('Mock Update:', strategy);
        const index = MOCK_DATA.findIndex(item => item.code === strategy.code);
        if (index > -1) MOCK_DATA[index] = { ...MOCK_DATA[index], ...strategy };
        return { status: 'success', message: 'Mock update successful' };
    }

    // Prepare form data for GAS
    // We send action='update' and the strategy data
    // Note: complex objects usually need to be JSON stringified or sent as individual fields
    // Here we'll send it as a JSON string in a 'data' field for the GAS to parse
    const formData = new URLSearchParams();
    formData.append('action', 'update');
    formData.append('data', JSON.stringify(strategy));

    const response = await axios.post(GOOGLE_SCRIPT_URL, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
};

export const fetchStockPrice = async (code) => {
    // 使用 GAS (Google Apps Script) 當作 Proxy 來繞過 CORS 限制
    // 這是最穩定抓取證交所資料的方式
    const formData = new URLSearchParams();
    formData.append('action', 'getPrice');
    formData.append('code', code);

    try {
        const response = await axios.post(GOOGLE_SCRIPT_URL, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data;
    } catch (e) {
        console.error('Fetch price via Proxy failed', e);
        return { status: 'error', message: 'Proxy Error' };
    }
};

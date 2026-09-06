import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY! // Uses the secret key to bypass security policies
);

// NIFTY 50 Stocks
const nifty50 = [
    { symbol: 'RELIANCE.NS', company_name: 'Reliance Industries' },
    { symbol: 'TCS.NS', company_name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK.NS', company_name: 'HDFC Bank' },
    { symbol: 'ICICIBANK.NS', company_name: 'ICICI Bank' },
    { symbol: 'INFY.NS', company_name: 'Infosys' },
    { symbol: 'SBIN.NS', company_name: 'State Bank of India' },
    { symbol: 'BHARTIARTL.NS', company_name: 'Bharti Airtel' },
    { symbol: 'ITC.NS', company_name: 'ITC Limited' },
    { symbol: 'HINDUNILVR.NS', company_name: 'Hindustan Unilever' },
    { symbol: 'LT.NS', company_name: 'Larsen & Toubro' },
    { symbol: 'BAJFINANCE.NS', company_name: 'Bajaj Finance' },
    { symbol: 'HCLTECH.NS', company_name: 'HCL Technologies' },
    { symbol: 'MARUTI.NS', company_name: 'Maruti Suzuki' },
    { symbol: 'SUNPHARMA.NS', company_name: 'Sun Pharmaceutical' },
    { symbol: 'TATAMOTORS.NS', company_name: 'Tata Motors' },
    { symbol: 'M&M.NS', company_name: 'Mahindra & Mahindra' },
    { symbol: 'ASIANPAINT.NS', company_name: 'Asian Paints' },
    { symbol: 'ULTRACEMCO.NS', company_name: 'UltraTech Cement' },
    { symbol: 'TITAN.NS', company_name: 'Titan Company' },
    { symbol: 'NTPC.NS', company_name: 'NTPC Limited' },
    { symbol: 'TATASTEEL.NS', company_name: 'Tata Steel' },
    { symbol: 'KOTAKBANK.NS', company_name: 'Kotak Mahindra Bank' },
    { symbol: 'BAJAJFINSV.NS', company_name: 'Bajaj Finserv' },
    { symbol: 'AXISBANK.NS', company_name: 'Axis Bank' },
    { symbol: 'INDUSINDBK.NS', company_name: 'IndusInd Bank' },
    { symbol: 'WIPRO.NS', company_name: 'Wipro' },
    { symbol: 'NESTLEIND.NS', company_name: 'Nestle India' },
    { symbol: 'POWERGRID.NS', company_name: 'Power Grid Corp' },
    { symbol: 'ADANIENT.NS', company_name: 'Adani Enterprises' },
    { symbol: 'ADANIPORTS.NS', company_name: 'Adani Ports' },
    { symbol: 'GRASIM.NS', company_name: 'Grasim Industries' },
    { symbol: 'TECHM.NS', company_name: 'Tech Mahindra' },
    { symbol: 'JSWSTEEL.NS', company_name: 'JSW Steel' },
    { symbol: 'HINDALCO.NS', company_name: 'Hindalco Industries' },
    { symbol: 'CIPLA.NS', company_name: 'Cipla' },
    { symbol: 'DRREDDY.NS', company_name: 'Dr. Reddy\'s Laboratories' },
    { symbol: 'TATACHEM.NS', company_name: 'Tata Chemicals' },
    { symbol: 'ONGC.NS', company_name: 'ONGC' },
    { symbol: 'COALINDIA.NS', company_name: 'Coal India' },
    { symbol: 'TATACONSUM.NS', company_name: 'Tata Consumer Products' },
    { symbol: 'BAJAJ-AUTO.NS', company_name: 'Bajaj Auto' },
    { symbol: 'BRITANNIA.NS', company_name: 'Britannia Industries' },
    { symbol: 'EICHERMOT.NS', company_name: 'Eicher Motors' },
    { symbol: 'HEROMOTOCO.NS', company_name: 'Hero MotoCorp' },
    { symbol: 'DIVISLAB.NS', company_name: 'Divi\'s Laboratories' },
    { symbol: 'APOLLOHOSP.NS', company_name: 'Apollo Hospitals' },
    { symbol: 'UPL.NS', company_name: 'UPL Limited' },
    { symbol: 'SHREECEM.NS', company_name: 'Shree Cement' },
    { symbol: 'BPCL.NS', company_name: 'Bharat Petroleum' },
    { symbol: 'LTIM.NS', company_name: 'LTIMindtree' }
];

async function seed() {
    console.log('🌱 Seeding 50 Indian Stocks...');

    const { data, error } = await supabase
        .from('stocks_metadata')
        .upsert(nifty50, { onConflict: 'symbol' }); // 'upsert' safely updates if you run it twice

    if (error) {
        console.error('❌ Error seeding data:', error.message);
    } else {
        console.log('✅ Successfully seeded 50 stocks into Supabase!');
    }
}

seed();
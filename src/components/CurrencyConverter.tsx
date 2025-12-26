import { useState, useEffect } from 'react';
import { RefreshCw, DollarSign } from 'lucide-react';

interface CurrencyConverterProps {
    onCurrencyChange: (currency: string, rate: number) => void;
}

const currencies = [
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];

export default function CurrencyConverter({ onCurrencyChange }: CurrencyConverterProps) {
    const [selectedCurrency, setSelectedCurrency] = useState('GHS');
    const [rates, setRates] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchRates = async () => {
        setLoading(true);
        setError('');
        try {
            // Using exchangerate-api.com (free tier)
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/GHS');
            if (!response.ok) throw new Error('Failed to fetch rates');
            const data = await response.json();
            setRates(data.rates);
            onCurrencyChange(selectedCurrency, data.rates[selectedCurrency] || 1);
        } catch (err) {
            setError('Unable to load exchange rates. Using default rates.');
            // Fallback rates (approximate as of 2025)
            const fallbackRates = {
                GHS: 1,
                USD: 0.085,
                EUR: 0.078,
                GBP: 0.067,
                CAD: 0.11,
                AUD: 0.12,
            };
            setRates(fallbackRates);
            onCurrencyChange(selectedCurrency, fallbackRates[selectedCurrency] || 1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    const handleCurrencyChange = (currency: string) => {
        setSelectedCurrency(currency);
        onCurrencyChange(currency, rates[currency] || 1);
    };

    const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);

    return (
        <div className="bg-white dark:bg-[#111c3e] rounded-lg p-6 mb-8 border border-gray-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Currency Converter
                    </h3>
                </div>
                <button
                    onClick={fetchRates}
                    disabled={loading}
                    className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Currency
                    </label>
                    <select
                        value={selectedCurrency}
                        onChange={(e) => handleCurrencyChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {currencies.map((currency) => (
                            <option key={currency.code} value={currency.code}>
                                {currency.symbol} {currency.name} ({currency.code})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Base: ₵1 GHS = {selectedCurrencyData?.symbol}{rates[selectedCurrency]?.toFixed(4) || '1.0000'} {selectedCurrency}
                    </div>
                    {error && (
                        <div className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Prices are displayed in your selected currency. Exchange rates are updated regularly.
            </div>
        </div>
    );
}


import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

// --- TYPES & INTERFACES ---
type ChartDataType = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  sma?: number;
  ema?: number;
  csv?: number;
};
type WindowState = {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
};
type Position = { id: string; symbol: string; quantity: number; entryPrice: number; type: 'BUY' | 'SELL'; };
type Trade = { id: string; symbol: string; quantity: number; entryPrice: number; exitPrice: number; pnl: number; type: 'BUY' | 'SELL'; timestamp: string; };
type CopilotMessage = { sender: 'user' | 'bot' | 'system'; text: string; };

// --- CONSTANTS ---
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Quant Copilot will be disabled.");
}
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
const QUANT_COPILOT_SYS_INSTRUCTION = "You are Quant Copilot, an AI assistant for a financial trading terminal. You are an expert in quantitative analysis, trading strategies, and financial indicators. Your explanations should be clear, concise, and accurate. When asked to generate a trading rule, provide a simple, logic-based rule in plain English that a user could conceptually apply. Do not provide financial advice. All generated rules are for paper trading and educational purposes only. Use markdown for formatting.";

const INITIAL_APPS = {
  'chart': { name: 'Price Chart', defaultSize: { width: 700, height: 500 } },
  'ticket': { name: 'Order Ticket', defaultSize: { width: 350, height: 450 } },
  'positions': { name: 'Positions & History', defaultSize: { width: 600, height: 400 } },
  'news': { name: 'News Ticker', defaultSize: { width: 500, height: 100 } },
  'notepad': { name: 'Notepad', defaultSize: { width: 400, height: 300 } },
  'csv': { name: 'CSV Importer', defaultSize: { width: 350, height: 200 } },
  'copilot': { name: 'Quant Copilot', defaultSize: { width: 450, height: 600 } },
  'browser': { name: 'Web Browser', defaultSize: { width: 800, height: 600 } },
};
type AppId = keyof typeof INITIAL_APPS;

// --- SVG ICONS ---
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const MaximizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m4.5 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>;
const MinimizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>;
const RestoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" /></svg>;
const AppIcon = ({ appId }: { appId: string }) => {
    // FIX: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
    const icons: { [key: string]: React.ReactElement } = {
        chart: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
        ticket: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>,
        positions: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75" /></svg>,
        news: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>,
        notepad: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
        csv: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
        copilot: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5M19.5 8.25h-1.5m-15 3.75h1.5m15 0h1.5m-15 3.75h1.5m15 0h1.5M12 6.75A5.25 5.25 0 006.75 12a5.25 5.25 0 005.25 5.25a5.25 5.25 0 005.25-5.25A5.25 5.25 0 0012 6.75z" /></svg>,
        browser: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
    };
    return icons[appId] || icons['chart'];
};

// --- HELPER FUNCTIONS ---
const generateRandomWalk = (startPrice: number): number => {
  const change = (Math.random() - 0.5) * 2; // -1 to 1
  return Math.max(10, startPrice + change); // Ensure price doesn't go below 10
};

const calculateSMA = (data: ChartDataType[], period: number): (number | undefined)[] => {
  if (period > data.length) return [];
  const result = Array(period - 1).fill(undefined);
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
    result.push(sum / period);
  }
  return result;
};

const calculateEMA = (data: ChartDataType[], period: number): (number | undefined)[] => {
    if (period > data.length) return [];
    const k = 2 / (period + 1);
    const result: (number | undefined)[] = Array(period-1).fill(undefined);
    let ema = data.slice(0, period).reduce((acc, val) => acc + val.close, 0) / period;
    result.push(ema);
    for (let i = period; i < data.length; i++) {
        ema = (data[i].close - ema) * k + ema;
        result.push(ema);
    }
    return result;
};

// --- CUSTOM HOOKS ---
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}


// --- APP COMPONENTS ---

const PriceChartApp = React.memo(({ chartData, indicators, setIndicators, chartType, setChartType, addCsvData }: {
    chartData: ChartDataType[];
    indicators: { sma: boolean; ema: boolean; };
    setIndicators: React.Dispatch<React.SetStateAction<{ sma: boolean; ema: boolean; }>>;
    chartType: 'line' | 'candlestick';
    setChartType: React.Dispatch<React.SetStateAction<'line' | 'candlestick'>>;
    addCsvData: (data: {time: number, value: number}[]) => void;
}) => {
    
  const CustomCandlestick = (props: any) => {
    const { x, y, width, height, low, high, open, close } = props;
    const isRising = close > open;
    const color = isRising ? '#10b981' : '#ef4444'; // green-500, red-500
    const wickX = x + width / 2;

    return (
      <g stroke={color} fill={isRising ? 'none' : color} strokeWidth="1">
        <line x1={wickX} y1={y} x2={wickX} y2={y + height} />
        <rect x={x} y={isRising ? y + (open-low) : y + (close-low)} width={width} height={Math.abs(open - close)} />
      </g>
    );
  };

    const domain = [
        Math.min(...chartData.map(d => d.low)),
        Math.max(...chartData.map(d => d.high)),
    ];

    return (
        <div className="bg-slate-800 p-2 flex flex-col h-full">
            <div className="flex items-center space-x-4 mb-2 px-2">
                <span className="text-lg font-bold text-cyan-400">BTC/USD</span>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setChartType('line')} className={`px-2 py-1 text-xs rounded ${chartType === 'line' ? 'bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'}`}>Line</button>
                    <button onClick={() => setChartType('candlestick')} className={`px-2 py-1 text-xs rounded ${chartType === 'candlestick' ? 'bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'}`}>Candles</button>
                </div>
                <div className="flex items-center space-x-3">
                    <label className="flex items-center text-xs space-x-1"><input type="checkbox" checked={indicators.sma} onChange={e => setIndicators(s => ({...s, sma: e.target.checked}))} className="form-checkbox h-3 w-3 bg-slate-700 border-slate-600"/><span>SMA(20)</span></label>
                    <label className="flex items-center text-xs space-x-1"><input type="checkbox" checked={indicators.ema} onChange={e => setIndicators(s => ({...s, ema: e.target.checked}))} className="form-checkbox h-3 w-3 bg-slate-700 border-slate-600"/><span>EMA(20)</span></label>
                </div>
            </div>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} domain={domain} orientation="right" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} labelStyle={{ color: '#94a3b8' }} itemStyle={{fontSize: 12}} />
                        <Legend wrapperStyle={{fontSize: 12, paddingTop: '10px'}}/>
                        {chartType === 'line' && <Line type="monotone" dataKey="close" stroke="#38bdf8" dot={false} strokeWidth={2} name="Close"/>}
                        {chartType === 'candlestick' && <Bar dataKey="close" shape={<CustomCandlestick />} name="Price" />}
                        {indicators.sma && <Line type="monotone" dataKey="sma" stroke="#facc15" dot={false} strokeWidth={1.5} name="SMA(20)"/>}
                        {indicators.ema && <Line type="monotone" dataKey="ema" stroke="#a78bfa" dot={false} strokeWidth={1.5} name="EMA(20)"/>}
                        {chartData[0]?.csv !== undefined && <Line type="monotone" dataKey="csv" stroke="#f472b6" dot={false} strokeWidth={1.5} name="CSV Data" strokeDasharray="3 3"/>}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

const OrderTicketApp = React.memo(({ positions, setPositions, setTrades, lastPrice, showConfirm }: {
    positions: Position[];
    setPositions: React.Dispatch<React.SetStateAction<Position[]>>;
    setTrades: React.Dispatch<React.SetStateAction<Trade[]>>;
    lastPrice: number;
    showConfirm: (message: string, onConfirm: () => void) => void;
}) => {
    const [symbol] = useState('BTC/USD');
    const [quantity, setQuantity] = useState(1);
    const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
    const [limitPrice, setLimitPrice] = useState(lastPrice);

    useEffect(() => {
        if (orderType === 'market') setLimitPrice(lastPrice);
    }, [lastPrice, orderType]);
    
    const pnl = useMemo(() => {
        const pos = positions.find(p => p.symbol === symbol);
        if (!pos) return 0;
        return (lastPrice - pos.entryPrice) * pos.quantity * (pos.type === 'BUY' ? 1 : -1);
    }, [positions, lastPrice, symbol]);

    const handleOrder = (type: 'BUY' | 'SELL') => {
      const price = orderType === 'market' ? lastPrice : limitPrice;
      const message = `${type} ${quantity} ${symbol} @ ${price.toFixed(2)}?`;
      
      showConfirm(message, () => {
        const existingPosition = positions.find(p => p.symbol === symbol);
        if (existingPosition) {
            // Closing or reducing position
            const closeQty = Math.min(Math.abs(existingPosition.quantity), quantity);
            if (existingPosition.type !== type) {
                const newTrade: Trade = {
                    id: Date.now().toString(),
                    symbol,
                    quantity: closeQty,
                    entryPrice: existingPosition.entryPrice,
                    exitPrice: price,
                    pnl: (price - existingPosition.entryPrice) * closeQty * (existingPosition.type === 'BUY' ? 1 : -1),
                    type: existingPosition.type,
                    timestamp: new Date().toISOString(),
                };
                setTrades(prev => [newTrade, ...prev]);

                const remainingQty = existingPosition.quantity - closeQty;
                if (remainingQty > 0) {
                    setPositions(prev => prev.map(p => p.id === existingPosition.id ? {...p, quantity: remainingQty} : p));
                } else {
                    setPositions(prev => prev.filter(p => p.id !== existingPosition.id));
                }
            } else {
                // Averaging down/up
                 const newAvgPrice = ((existingPosition.entryPrice * existingPosition.quantity) + (price * quantity)) / (existingPosition.quantity + quantity);
                 setPositions(prev => prev.map(p => p.id === existingPosition.id ? { ...p, quantity: existingPosition.quantity + quantity, entryPrice: newAvgPrice } : p));
            }
        } else {
            // Opening new position
            const newPosition: Position = { id: Date.now().toString(), symbol, quantity, entryPrice: price, type };
            setPositions(prev => [...prev, newPosition]);
        }
      });
    };

    return (
        <div className="bg-slate-800 p-4 flex flex-col h-full text-sm">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">Order Ticket</h3>
            <div className="space-y-4 flex-grow">
                <div><label className="block text-slate-400">Symbol</label><input type="text" value={symbol} readOnly className="w-full bg-slate-900 border border-slate-700 rounded p-2 mt-1"/></div>
                <div><label className="block text-slate-400">Quantity</label><input type="number" value={quantity} onChange={e => setQuantity(Math.max(0.01, parseFloat(e.target.value)))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 mt-1"/></div>
                <div>
                    <label className="block text-slate-400">Order Type</label>
                    <select value={orderType} onChange={e => setOrderType(e.target.value as 'market'|'limit')} className="w-full bg-slate-900 border border-slate-700 rounded p-2 mt-1">
                        <option value="market">Market</option>
                        <option value="limit">Limit</option>
                    </select>
                </div>
                {orderType === 'limit' && <div><label className="block text-slate-400">Limit Price</label><input type="number" value={limitPrice} onChange={e => setLimitPrice(parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 mt-1"/></div>}
                
            </div>
            <div className="border-t border-slate-700 pt-3">
                 <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-400">Current P&L:</span>
                    <span className={`font-mono ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pnl.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleOrder('BUY')} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition-colors">BUY</button>
                    <button onClick={() => handleOrder('SELL')} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition-colors">SELL</button>
                </div>
            </div>
        </div>
    );
});

const PositionsHistoryApp = React.memo(({ positions, trades, lastPrice }: { positions: Position[], trades: Trade[], lastPrice: number }) => {
    const [activeTab, setActiveTab] = useState('positions');
    return (
        <div className="bg-slate-800 p-2 flex flex-col h-full text-xs">
            <div className="flex border-b border-slate-700 mb-2">
                <button onClick={() => setActiveTab('positions')} className={`px-4 py-2 ${activeTab === 'positions' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400'}`}>Positions ({positions.length})</button>
                <button onClick={() => setActiveTab('history')} className={`px-4 py-2 ${activeTab === 'history' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400'}`}>History ({trades.length})</button>
            </div>
            <div className="flex-grow overflow-auto">
                {activeTab === 'positions' ? (
                    <table className="w-full">
                        <thead className="sticky top-0 bg-slate-800"><tr className="text-left text-slate-400">
                            <th className="p-1 font-semibold">Symbol</th><th className="p-1 font-semibold">Qty</th><th className="p-1 font-semibold">Entry</th><th className="p-1 font-semibold">Type</th><th className="p-1 font-semibold">P&L</th>
                        </tr></thead>
                        <tbody>{positions.map(p => {
                            const pnl = (lastPrice - p.entryPrice) * p.quantity * (p.type === 'BUY' ? 1 : -1);
                            return <tr key={p.id} className="border-t border-slate-700 font-mono">
                                <td className="p-1">{p.symbol}</td><td className="p-1">{p.quantity}</td><td className="p-1">{p.entryPrice.toFixed(2)}</td>
                                <td className={`p-1 font-bold ${p.type === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>{p.type}</td>
                                <td className={`p-1 ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pnl.toFixed(2)}</td>
                            </tr>
                        })}</tbody>
                    </table>
                ) : (
                    <table className="w-full">
                        <thead className="sticky top-0 bg-slate-800"><tr className="text-left text-slate-400">
                            <th className="p-1 font-semibold">Symbol</th><th className="p-1 font-semibold">Qty</th><th className="p-1 font-semibold">Entry</th><th className="p-1 font-semibold">Exit</th><th className="p-1 font-semibold">P&L</th><th className="p-1 font-semibold">Time</th>
                        </tr></thead>
                        <tbody>{trades.map(t => <tr key={t.id} className="border-t border-slate-700 font-mono">
                            <td className="p-1">{t.symbol}</td><td className="p-1">{t.quantity}</td><td className="p-1">{t.entryPrice.toFixed(2)}</td><td className="p-1">{t.exitPrice.toFixed(2)}</td>
                            <td className={`p-1 ${t.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{t.pnl.toFixed(2)}</td>
                            <td className="p-1">{new Date(t.timestamp).toLocaleTimeString()}</td>
                        </tr>)}</tbody>
                    </table>
                )}
            </div>
        </div>
    );
});

const NewsTickerApp = React.memo(() => {
    const headlines = useMemo(() => [
        "GLOBAL MARKETS RALLY ON POSITIVE INFLATION DATA", "CENTRAL BANK HINTS AT POLICY SHIFT", "TECH STOCKS SURGE AS CHIP SHORTAGE EASES", "COMMODITY PRICES VOLATILE AMID GEOPOLITICAL TENSIONS", "CRYPTO MARKET SEES RECORD INFLOWS", "NEW IPO PERFORMS STRONGLY ON DEBUT", "REGULATORS ANNOUNCE NEW FRAMEWORK FOR DIGITAL ASSETS"
    ], []);
    return (
        <div className="bg-slate-800 flex items-center h-full overflow-hidden whitespace-nowrap">
            <div className="animate-marquee py-2">
                {headlines.map((h, i) => <span key={i} className="mx-8 text-sm font-semibold">{h} <span className="text-cyan-400">||</span> </span>)}
            </div>
             <div className="animate-marquee py-2">
                {headlines.map((h, i) => <span key={i} className="mx-8 text-sm font-semibold">{h} <span className="text-cyan-400">||</span> </span>)}
            </div>
        </div>
    );
});

const NotepadApp = React.memo(() => {
    const [notes, setNotes] = useLocalStorage('terminal-notepad', 'My trading notes...');
    return (
        <textarea
            className="w-full h-full bg-slate-800 text-slate-300 p-2 border-none outline-none resize-none font-mono text-sm"
            value={notes}
            onChange={e => setNotes(e.target.value)}
        />
    );
});

const CsvImporterApp = React.memo(({ onImport }: { onImport: (data: {time: number, value: number}[]) => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                const lines = text.split('\n').slice(1); // Assume header row
                const parsedData = lines.map(line => {
                    const [time, value] = line.split(',');
                    // Assuming time is a Unix timestamp
                    return { time: parseInt(time) * 1000, value: parseFloat(value) };
                }).filter(d => !isNaN(d.time) && !isNaN(d.value));
                if (parsedData.length === 0) throw new Error("No valid data found in CSV.");
                onImport(parsedData);
                setError('');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to parse CSV.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="bg-slate-800 p-4 h-full flex flex-col justify-center items-center">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">Import CSV</h3>
            <p className="text-xs text-slate-400 mb-4 text-center">CSV must have 'time,value' columns. Time should be a Unix timestamp.</p>
            <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFileChange} className="hidden" />
            {/* FIX: Corrected typo from `fileInput-  ref` to `fileInputRef` to fix reference error. */}
            <button onClick={() => fileInputRef.current?.click()} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors">Select File</button>
            {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
        </div>
    );
});

const QuantCopilotApp = React.memo(() => {
    const [messages, setMessages] = useState<CopilotMessage[]>([{ sender: 'system', text: 'Welcome to Quant Copilot. Ask about indicators or for trading rule ideas.' }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [strategies, setStrategies] = useLocalStorage<string[]>('terminal-strategies', []);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !ai) return;
        const userMessage: CopilotMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // FIX: Corrected `contents` parameter to be a simple string as per @google/genai guidelines for single-turn text generation.
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-pro',
              contents: input,
              config: { systemInstruction: QUANT_COPILOT_SYS_INSTRUCTION },
            });
            const botMessage: CopilotMessage = { sender: 'bot', text: response.text };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: CopilotMessage = { sender: 'system', text: 'Error fetching response from AI.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const saveStrategy = (strategy: string) => {
        if (!strategies.includes(strategy)) {
            setStrategies(prev => [...prev, strategy]);
        }
    };
    
    return (
        <div className="bg-slate-800 flex flex-col h-full">
            <div className="flex-grow p-3 overflow-y-auto space-y-4 text-sm">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-2 rounded-lg max-w-xs md:max-w-md ${
                            msg.sender === 'user' ? 'bg-cyan-800' :
                            msg.sender === 'bot' ? 'bg-slate-700' : 'bg-slate-600 text-center w-full'
                        }`}>
                           {/* FIX: Removed incorrect newline-to-<br> replacement to better handle markdown/code formatting from the AI. Formatting is now handled by CSS. */}
                           <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{__html: msg.text}} />
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex justify-start"><div className="p-2 rounded-lg bg-slate-700">Thinking...</div></div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-2 border-t border-slate-700">
                <div className="flex">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                           placeholder={!ai ? "API Key not set" : "Ask something..."} disabled={isLoading || !ai}
                           className="w-full bg-slate-900 border border-slate-700 rounded-l p-2 outline-none disabled:opacity-50" />
                    <button onClick={handleSend} disabled={isLoading || !ai} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-r disabled:opacity-50 disabled:cursor-not-allowed">Send</button>
                </div>
            </div>
        </div>
    );
});

const BrowserApp = React.memo(() => {
    const [url, setUrl] = useState('https://www.bis.org');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    return (
        <div className="bg-slate-800 flex flex-col h-full">
            <div className="flex items-center p-1 bg-slate-700">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)}
                       className="w-full bg-slate-800 border border-slate-600 rounded p-1 text-sm outline-none"/>
            </div>
            <div className="flex-grow relative">
                <iframe ref={iframeRef} src={url} className="w-full h-full border-0" title="Web Browser"
                        sandbox="allow-scripts allow-same-origin"
                        onError={() => console.log('Iframe failed to load')}
                ></iframe>
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center pointer-events-none opacity-0"
                     style={{ transition: 'opacity 0.3s' }}
                     ref={el => { if (el) el.style.opacity = iframeRef.current?.src === url ? '0' : '1'; }}
                >
                    <p className="text-slate-400 text-center p-4">
                        Note: Many websites block embedding due to security policies (X-Frame-Options).
                        If the content doesn't load, the website is likely protected.
                    </p>
                </div>
            </div>
        </div>
    );
});

const DraggableWindow = React.memo(({
    win, children, onFocus, onUpdate, onClose, onMinimize, onMaximize
}: {
    win: WindowState;
    children: React.ReactNode;
    onFocus: (id: string) => void;
    onUpdate: (id: string, updates: Partial<WindowState>) => void;
    onClose: (id:string) => void;
    onMinimize: (id: string) => void;
    onMaximize: (id: string) => void;
}) => {
    const headerRef = useRef<HTMLDivElement>(null);
    const windowRef = useRef<HTMLDivElement>(null);
    
    const handleDrag = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        onFocus(win.id);

        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = win.x;
        const startTop = win.y;

        const doDrag = (moveEvent: MouseEvent) => {
            const newX = startLeft + moveEvent.clientX - startX;
            const newY = startTop + moveEvent.clientY - startY;
            onUpdate(win.id, { x: newX, y: newY });
        };

        const stopDrag = () => {
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);
        };

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    }, [win.id, win.x, win.y, onFocus, onUpdate]);

    const handleResize = useCallback((e: React.MouseEvent, corner: string) => {
      e.preventDefault();
      onFocus(win.id);

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = win.width;
      const startHeight = win.height;
      const startLeft = win.x;
      const startTop = win.y;

      const doResize = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        let newWidth = startWidth, newHeight = startHeight, newX = startLeft, newY = startTop;

        if (corner.includes('right')) newWidth = Math.max(200, startWidth + dx);
        if (corner.includes('bottom')) newHeight = Math.max(150, startHeight + dy);
        if (corner.includes('left')) {
            newWidth = Math.max(200, startWidth - dx);
            newX = startLeft + dx;
        }
        if (corner.includes('top')) {
            newHeight = Math.max(150, startHeight - dy);
            newY = startTop + dy;
        }

        onUpdate(win.id, { width: newWidth, height: newHeight, x: newX, y: newY });
      };

      const stopResize = () => {
          document.removeEventListener('mousemove', doResize);
          document.removeEventListener('mouseup', stopResize);
      };

      document.addEventListener('mousemove', doResize);
      document.addEventListener('mouseup', stopResize);
    }, [win.id, win.x, win.y, win.width, win.height, onFocus, onUpdate]);

    const style: React.CSSProperties = win.isMaximized ? {
        top: 0, left: 0, width: '100%', height: 'calc(100% - 40px)', zIndex: win.zIndex,
    } : {
        top: win.y, left: win.x, width: win.width, height: win.height, zIndex: win.zIndex,
    };
    
    if (win.isMinimized) return null;

    return (
        <div ref={windowRef} style={style}
             className={`absolute flex flex-col bg-slate-800 border border-slate-700 shadow-2xl shadow-black/50 rounded-lg overflow-hidden transition-all duration-200 ${win.isMaximized ? 'rounded-none' : ''}`}
             onMouseDown={() => onFocus(win.id)}>
            <div ref={headerRef} onMouseDown={win.isMaximized ? undefined : handleDrag}
                 className={`flex items-center justify-between px-3 h-8 bg-slate-700/80 text-slate-300 cursor-move`}>
                <div className="flex items-center space-x-2">
                    <AppIcon appId={win.appId}/>
                    <span className="text-xs font-bold select-none">{win.title}</span>
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={() => onMinimize(win.id)} className="p-1 rounded-full hover:bg-slate-600"><MinimizeIcon /></button>
                    <button onClick={() => onMaximize(win.id)} className="p-1 rounded-full hover:bg-slate-600">{win.isMaximized ? <RestoreIcon /> : <MaximizeIcon />}</button>
                    <button onClick={() => onClose(win.id)} className="p-1 rounded-full hover:bg-red-500"><CloseIcon /></button>
                </div>
            </div>
            <div className="flex-grow overflow-hidden relative">
                {children}
            </div>
            {!win.isMaximized && (
              <>
                <div onMouseDown={(e) => handleResize(e, 'bottom-right')} className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize" />
                <div onMouseDown={(e) => handleResize(e, 'bottom-left')} className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize" />
                <div onMouseDown={(e) => handleResize(e, 'top-right')} className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize" />
                <div onMouseDown={(e) => handleResize(e, 'top-left')} className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize" />
                <div onMouseDown={(e) => handleResize(e, 'bottom')} className="absolute bottom-0 left-2 right-2 h-2 cursor-ns-resize" />
                <div onMouseDown={(e) => handleResize(e, 'top')} className="absolute top-0 left-2 right-2 h-2 cursor-ns-resize" />
                <div onMouseDown={(e) => handleResize(e, 'left')} className="absolute top-2 bottom-2 left-0 w-2 cursor-ew-resize" />
                <div onMouseDown={(e) => handleResize(e, 'right')} className="absolute top-2 bottom-2 right-0 w-2 cursor-ew-resize" />
              </>
            )}
        </div>
    );
});

const Taskbar = React.memo(({ windows, onFocus, onMinimize }: { windows: WindowState[]; onFocus: (id: string) => void; onMinimize: (id: string) => void; }) => (
    <div className="absolute bottom-0 left-0 right-0 h-10 bg-slate-800/80 backdrop-blur-sm border-t border-slate-700 flex items-center px-2 space-x-2 z-[99999]">
        {windows.map(win => (
            <button key={win.id} onClick={() => { onFocus(win.id); onMinimize(win.id); }}
                    className={`flex items-center space-x-2 px-3 py-1 rounded transition-colors ${win.isMinimized ? 'bg-slate-700' : 'bg-cyan-700/50'} hover:bg-cyan-600/70`}>
                <AppIcon appId={win.appId} />
                <span className="text-xs">{win.title}</span>
            </button>
        ))}
    </div>
));

const CommandLauncher = React.memo(({ onLaunch }: { onLaunch: (appId: AppId) => void }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    
    const filteredApps = useMemo(() =>
        Object.entries(INITIAL_APPS)
        .filter(([id, app]) => app.name.toLowerCase().includes(query.toLowerCase()))
    , [query]);

    const handleLaunch = (appId: AppId) => {
        onLaunch(appId);
        setQuery('');
        setIsOpen(false);
    };

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100000]">
            <input 
                type="text" 
                placeholder="Launch App..." 
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 150)}
                className="w-80 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2 text-lg outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {isOpen && filteredApps.length > 0 && (
                <div className="absolute top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                    <ul>
                        {filteredApps.map(([id, app]) => (
                            <li key={id} onMouseDown={() => handleLaunch(id as AppId)}
                                className="flex items-center space-x-3 px-4 py-2 hover:bg-slate-700 cursor-pointer">
                                <AppIcon appId={id}/>
                                <span>{app.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
});

const ConfirmDialog = ({ message, onConfirm, onCancel }: { message: string, onConfirm: () => void, onCancel: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100001]">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-2xl">
            <p className="mb-6">{message}</p>
            <div className="flex justify-end space-x-4">
                <button onClick={onCancel} className="px-4 py-2 rounded bg-slate-600 hover:bg-slate-500">Cancel</button>
                <button onClick={onConfirm} className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500">Confirm</button>
            </div>
        </div>
    </div>
);


// --- MAIN APP ---
const App = () => {
    const [windows, setWindows] = useLocalStorage<WindowState[]>('terminal-layout', []);
    const [highestZ, setHighestZ] = useState(10);
    
    const [chartData, setChartData] = useState<ChartDataType[]>([]);
    const [indicators, setIndicators] = useState({ sma: false, ema: false });
    const [chartType, setChartType] = useState<'line' | 'candlestick'>('candlestick');
    
    const [positions, setPositions] = useLocalStorage<Position[]>('terminal-positions', []);
    const [trades, setTrades] = useLocalStorage<Trade[]>('terminal-trades', []);

    const [confirmState, setConfirmState] = useState<{message: string, onConfirm: () => void} | null>(null);

    // Data feed
    useEffect(() => {
        const initialData: ChartDataType[] = [];
        let price = 50000;
        const now = Date.now();
        for (let i = 0; i < 100; i++) {
            const open = price;
            const high = open + Math.random() * 50;
            const low = open - Math.random() * 50;
            const close = (high + low) / 2 + (Math.random() - 0.5) * 30;
            price = close;
            initialData.push({ time: now - (100 - i) * 60000, open, high, low, close });
        }
        setChartData(initialData);

        const interval = setInterval(() => {
            setChartData(prevData => {
                const lastPoint = prevData[prevData.length - 1];
                const open = lastPoint.close;
                const high = open + Math.random() * 50;
                const low = open - Math.random() * 50;
                const close = (high + low) / 2 + (Math.random() - 0.5) * 30;
                const newPoint = { time: Date.now(), open, high, low, close };
                return [...prevData.slice(1), newPoint];
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    
    const processedChartData = useMemo(() => {
        let data = [...chartData];
        if (indicators.sma) {
            const smaValues = calculateSMA(data, 20);
            data = data.map((d, i) => ({ ...d, sma: smaValues[i] }));
        }
        if (indicators.ema) {
            const emaValues = calculateEMA(data, 20);
            data = data.map((d, i) => ({ ...d, ema: emaValues[i] }));
        }
        return data;
    }, [chartData, indicators]);

    const addCsvDataToChart = useCallback((csvData: {time: number, value: number}[]) => {
      setChartData(prevData => {
          const csvDataMap = new Map(csvData.map(d => [d.time, d.value]));
          // Find min/max of chart and csv to normalize
          const chartMin = Math.min(...prevData.map(d => d.low));
          const chartMax = Math.max(...prevData.map(d => d.high));
          const csvMin = Math.min(...csvData.map(d => d.value));
          const csvMax = Math.max(...csvData.map(d => d.value));

          return prevData.map(d => {
              const csvValue = csvDataMap.get(d.time);
              if (csvValue !== undefined) {
                  const normalizedValue = chartMin + ( (csvValue - csvMin) / (csvMax - csvMin) ) * (chartMax - chartMin);
                  return {...d, csv: normalizedValue};
              }
              return {...d, csv: undefined};
          });
      });
    }, []);

    const launchApp = useCallback((appId: AppId) => {
        const appConfig = INITIAL_APPS[appId];
        const newZ = highestZ + 1;
        const newWindow: WindowState = {
            id: `${appId}-${Date.now()}`,
            appId: appId,
            title: appConfig.name,
            x: 50 + (windows.length % 10) * 20,
            y: 50 + (windows.length % 10) * 20,
            width: appConfig.defaultSize.width,
            height: appConfig.defaultSize.height,
            zIndex: newZ,
            isMinimized: false,
            isMaximized: false,
        };
        setWindows(prev => [...prev, newWindow]);
        setHighestZ(newZ);
    }, [highestZ, windows.length, setWindows]);

    const focusWindow = useCallback((id: string) => {
        const win = windows.find(w => w.id === id);
        if (win && win.zIndex !== highestZ) {
            const newZ = highestZ + 1;
            setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: newZ } : w));
            setHighestZ(newZ);
        }
    }, [windows, highestZ, setWindows]);

    const updateWindow = useCallback((id: string, updates: Partial<WindowState>) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    }, [setWindows]);

    const closeWindow = useCallback((id: string) => {
        setWindows(prev => prev.filter(w => w.id !== id));
    }, [setWindows]);

    const minimizeWindow = useCallback((id: string) => {
        const win = windows.find(w => w.id === id);
        if (win) {
            setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
        }
    }, [windows, setWindows]);

    const maximizeWindow = useCallback((id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    }, [setWindows]);
    
    const showConfirm = (message: string, onConfirm: () => void) => {
      setConfirmState({ message, onConfirm });
    };

    const handleConfirm = () => {
        if(confirmState) {
          confirmState.onConfirm();
          setConfirmState(null);
        }
    };
    
    const handleCancel = () => setConfirmState(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.shiftKey && (e.key === 'B' || e.key === 'S')) {
            e.preventDefault();
            const type = e.key === 'B' ? 'BUY' : 'SELL';
            const price = processedChartData[processedChartData.length-1]?.close || 0;
            showConfirm(`${type} 1 BTC/USD @ Market (${price.toFixed(2)})?`, () => {
               // A simplified version of order logic for hotkeys
               const newPosition: Position = { id: Date.now().toString(), symbol: 'BTC/USD', quantity: 1, entryPrice: price, type };
               setPositions(prev => [...prev, newPosition]);
            });
          }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [processedChartData, setPositions]);

    const renderAppContent = (appId: string) => {
        const lastPrice = processedChartData[processedChartData.length - 1]?.close || 0;
        switch(appId) {
            case 'chart': return <PriceChartApp chartData={processedChartData} indicators={indicators} setIndicators={setIndicators} chartType={chartType} setChartType={setChartType} addCsvData={addCsvDataToChart} />;
            case 'ticket': return <OrderTicketApp positions={positions} setPositions={setPositions} setTrades={setTrades} lastPrice={lastPrice} showConfirm={showConfirm} />;
            case 'positions': return <PositionsHistoryApp positions={positions} trades={trades} lastPrice={lastPrice} />;
            case 'news': return <NewsTickerApp />;
            case 'notepad': return <NotepadApp />;
            case 'csv': return <CsvImporterApp onImport={addCsvDataToChart} />;
            case 'copilot': return <QuantCopilotApp />;
            case 'browser': return <BrowserApp />;
            default: return <div>Unknown App</div>;
        }
    };

    return (
        <div className="h-screen w-screen bg-slate-900 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden font-sans">
            <CommandLauncher onLaunch={launchApp}/>

            {windows.map(win => (
                <DraggableWindow
                    key={win.id}
                    win={win}
                    onFocus={focusWindow}
                    onUpdate={updateWindow}
                    onClose={closeWindow}
                    onMinimize={minimizeWindow}
                    onMaximize={maximizeWindow}
                >
                    {renderAppContent(win.appId)}
                </DraggableWindow>
            ))}

            <Taskbar windows={windows} onFocus={focusWindow} onMinimize={minimizeWindow} />

            {confirmState && <ConfirmDialog message={confirmState.message} onConfirm={handleConfirm} onCancel={handleCancel} />}
            <style jsx global>{`
              @keyframes marquee {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-100%); }
              }
              .animate-marquee {
                animation: marquee 40s linear infinite;
              }
              /* FIX: Added white-space: pre-wrap to preserve newlines and spacing in AI responses, improving readability of formatted text like lists and code blocks. */
              .prose { color: #d1d5db; white-space: pre-wrap; }
              .prose a { color: #38bdf8; }
              .prose strong { color: #f1f5f9; }
              .prose code { color: #f472b6; background-color: #334155; padding: 2px 4px; border-radius: 4px; }
              .prose pre { background-color: #1e293b; padding: 1rem; border-radius: 0.5rem; }
            `}</style>
        </div>
    );
};

export default App;
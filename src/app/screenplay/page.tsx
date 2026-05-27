"use client";

import { useState } from "react";
import { useStoryStore } from "@/store/storyStore";
import { OpeningPatternsDict } from "@/data/opening-patterns";

const SAMPLE_SCENE_TEXT = "Hẻm tối. Tiếng mưa rơi rả rích trên mái tôn. Mina đặt chiếc nồi cơm điện cũ kỹ lên mặt bàn rỉ sét, rút tua vít. Cô bắt đầu tháo tung nắp đáy. Vừa cạy ra, cô khựng lại. Bên trong không phải mâm nhiệt, mà là một bảng mạch chớp đèn đỏ.";

export default function ScreenplayPage() {
  const { applyCinematicPattern } = useStoryStore();
  const patternIds = Object.keys(OpeningPatternsDict);
  const [selectedPattern, setSelectedPattern] = useState(patternIds[0] || "");

  const handleGenerate = () => {
    if (!selectedPattern) return;
    try {
      applyCinematicPattern("SC01", selectedPattern, SAMPLE_SCENE_TEXT);
      alert(`[SUCCESS] Đã sinh Shot Intent thành công từ Pattern: ${selectedPattern}! Hãy chuyển sang tab T5 để xem.`);
    } catch (error) {
      alert("[ERROR] Lỗi khi sinh Shot: " + error);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-zinc-950 text-zinc-100 font-mono">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-b border-zinc-800 pb-4">
          <h1 className="text-3xl font-bold text-yellow-500">T4 - Screenplay</h1>
          <p className="text-zinc-400">Trạm điều khiển Kịch bản & Khởi tạo Cinematic Pattern</p>
        </div>

        {/* SCENE CARD */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <h2 className="text-xl font-bold text-zinc-300">SC01 - Hẻm sau nhà máy</h2>
            <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded">INT. NIGHT</span>
          </div>

          {/* SCREENPLAY TEXT PLACEHOLDER */}
          <div className="space-y-4 text-zinc-300 font-serif">
            <p className="text-sm italic text-zinc-400">Hẻm tối. Tiếng mưa rơi rả rích trên mái tôn.</p>
            <p className="text-base font-bold text-white text-center tracking-widest uppercase mt-4">Mina</p>
            <p className="text-base text-center w-2/3 mx-auto">(Lẩm bẩm)<br/>Mày giấu cái gì trong này thế hả ông già?</p>
            <p className="text-sm italic text-zinc-400 mt-4">{SAMPLE_SCENE_TEXT}</p>
          </div>

          {/* CINEMATIC CONTROL STATION */}
          <div className="bg-black p-5 rounded border border-zinc-800 space-y-4 mt-8 font-mono">
            <h3 className="text-sm font-bold text-yellow-600 tracking-wider">CINEMATIC CONTROL</h3>
            <div className="flex flex-col md:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-zinc-500 mb-2">CHỌN PATTERN ĐẠO DIỄN</label>
                <select
                  className="w-full bg-zinc-900 border border-zinc-700 text-white rounded p-3 text-sm focus:border-yellow-500 focus:outline-none transition"
                  value={selectedPattern}
                  onChange={(e) => setSelectedPattern(e.target.value)}
                >
                  {patternIds.map(id => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerate}
                className="w-full md:w-auto px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded transition whitespace-nowrap"
              >
                GENERATE SHOT INTENTS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useStoryStore } from '@/store/storyStore';

function ExportHubContent() {
  const { shot_runtimes, active_shot_id, exportShotRenderPackage, markShotAsExported } = useStoryStore();

  const activeShot = active_shot_id ? shot_runtimes[active_shot_id] : null;

  const renderPackage = useMemo(() => {
    if (activeShot && activeShot.P_Computed.generation_status === 'generated') {
      try {
        return exportShotRenderPackage(active_shot_id!, 'flux');
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [activeShot, active_shot_id, exportShotRenderPackage]);

  if (!activeShot) {
    return <div className="p-8 text-zinc-400">Không có Shot nào đang active. Hãy chọn từ T5.</div>;
  }

  const handleCopyPrompt = () => {
    if (renderPackage) {
      navigator.clipboard.writeText(renderPackage.positive_prompt);
      alert('Đã copy Prompt!');
    }
  };

  const handleDownloadJSON = () => {
    if (renderPackage) {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(renderPackage, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', `RenderPackage_${activeShot.A_Identity.shot_id}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  const handleMarkExported = () => {
    markShotAsExported(activeShot.A_Identity.shot_id);
    alert(`Đã chuyển trạng thái ${activeShot.A_Identity.shot_id} thành EXPORTED_FOR_RENDER`);
  };

  return (
    <div className="p-8 min-h-screen bg-zinc-950 text-zinc-100 font-mono">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-500">T6 - Export Hub</h1>
            <p className="text-zinc-400">Human-in-the-loop Production Packet</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-500">ACTIVE SHOT</div>
            <div className="text-xl font-bold">{activeShot.A_Identity.shot_id}</div>
            <div className="text-xs text-yellow-500 mt-1">
              STATUS: {activeShot.Q_RenderState.export_status || 'DRAFT'}
            </div>
          </div>
        </div>

        {renderPackage ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lệnh Sản Xuất */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg space-y-4">
              <h2 className="text-xl font-semibold text-zinc-300 border-b border-zinc-800 pb-2">Production Packet</h2>

              <div>
                <label className="text-xs font-bold text-zinc-500">POSITIVE PROMPT (EN)</label>
                <div className="bg-black p-3 rounded mt-1 text-sm text-green-400 break-words">
                  {renderPackage.positive_prompt}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500">NEGATIVE PROMPT</label>
                <div className="bg-black p-3 rounded mt-1 text-sm text-red-400 break-words">
                  {renderPackage.negative_prompt || 'N/A'}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button onClick={handleCopyPrompt} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm font-bold transition">
                  COPY PROMPT
                </button>
                <button onClick={handleDownloadJSON} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm font-bold transition">
                  DOWNLOAD JSON
                </button>
              </div>
            </div>

            {/* Tracking & Workflow */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg space-y-4">
              <h2 className="text-xl font-semibold text-zinc-300 border-b border-zinc-800 pb-2">Human Workflow</h2>

              <ul className="text-sm text-zinc-400 space-y-2 mb-6">
                <li>1. Xuất gói RenderPackage JSON.</li>
                <li>2. Tải file JSON lên Google Drive.</li>
                <li>3. Giao cho Artist nạp vào ComfyUI/Flux.</li>
                <li>4. Nhận link ảnh trả về để QA.</li>
              </ul>

              <button
                onClick={handleMarkExported}
                className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-black rounded font-bold transition uppercase"
              >
                MARK AS EXPORTED
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-zinc-900 border border-red-900 text-red-400 rounded text-center">
            Shot này chưa được sinh Prompt hoặc bị Stale. Vui lòng quay lại T5 để Generate AI Prompt trước khi Export.
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExportHubPage() {
  return (
    <DashboardLayout>
      <ExportHubContent />
    </DashboardLayout>
  );
}

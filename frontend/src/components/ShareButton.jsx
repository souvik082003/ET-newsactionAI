import { Share2 } from 'lucide-react';

export default function ShareButton({ articleInfo, actions }) {
  const handleShare = async () => {
    const text = [
      `📰 ${articleInfo?.title}`,
      '',
      `📖 Summary: ${articleInfo?.summary}`,
      '',
      `✅ Key Actions:`,
      actions?.actions || '',
      '',
      `⚠️ Risks:`,
      actions?.risks || '',
      '',
      '— Analyzed by ET NewsAction AI (Gemini + RAG)',
    ].join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: `ET NewsAction AI — ${articleInfo?.title}`,
          text: text,
        });
      } catch (e) {
        if (e.name !== 'AbortError') fallbackCopy(text);
      }
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    alert('Analysis copied to clipboard!');
  };

  return (
    <button onClick={handleShare} className="btn-ghost text-xs" aria-label="Share analysis">
      <Share2 size={12} /> Share
    </button>
  );
}

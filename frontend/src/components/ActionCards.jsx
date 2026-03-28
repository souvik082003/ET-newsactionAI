import CardItem from './CardItem';

const CARDS = [
  { key: 'affected', icon: '👥', title: "Who's Affected?", color: 'blue' },
  { key: 'meaning', icon: '📖', title: 'What Does It Mean?', color: 'orange' },
  { key: 'actions', icon: '✅', title: 'What Should I Do?', color: 'green' },
  { key: 'risks', icon: '⚠️', title: 'What If I Ignore It?', color: 'red' },
];

export default function ActionCards({ actions }) {
  if (!actions) return null;

  return (
    <div className="grid md:grid-cols-2 gap-4" role="list" aria-label="Action cards">
      {CARDS.map((c, i) => (
        <div key={c.key} role="listitem">
          <CardItem
            icon={c.icon}
            title={c.title}
            answer={actions[c.key] || 'Processing…'}
            color={c.color}
            delay={i * 0.1}
          />
        </div>
      ))}
    </div>
  );
}

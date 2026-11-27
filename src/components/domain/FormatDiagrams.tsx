import type { ReactNode, SVGProps } from "react";
import type { TournamentFormat } from "@/lib/types";

const ink = "currentColor";

function DiagramShell({
  title,
  description,
  children,
  viewBox = "0 0 360 200",
}: {
  title: string;
  description: string;
  children: ReactNode;
  viewBox?: string;
}) {
  return (
    <figure className="border-y border-line py-5">
      <svg
        viewBox={viewBox}
        role="img"
        aria-label={title}
        className="h-auto w-full max-w-full text-ink"
      >
        <title>{title}</title>
        <desc>{description}</desc>
        {children}
      </svg>
      <figcaption className="mt-3 text-sm leading-relaxed text-ink-muted">{description}</figcaption>
    </figure>
  );
}

function Slot({
  x,
  y,
  w = 56,
  h = 22,
  label,
  faint = false,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  faint?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="none"
        stroke={ink}
        strokeOpacity={faint ? 0.28 : 0.55}
        strokeWidth={1}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 4}
        textAnchor="middle"
        fontSize={11}
        fill={ink}
        fillOpacity={faint ? 0.45 : 0.85}
        style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
      >
        {label}
      </text>
    </g>
  );
}

function Line(props: SVGProps<SVGLineElement>) {
  return <line stroke={ink} strokeOpacity={0.35} strokeWidth={1} {...props} />;
}

function OlympicDiagram() {
  return (
    <DiagramShell
      title="Схема олимпийской сетки на 8"
      description="Восемь игроков: четыре матча первого круга, два полуфинала, финал. Проигравший выбывает. Пунктиром — матч за третье место."
      viewBox="0 0 400 248"
    >
      {(["A", "B", "C", "D", "E", "F", "G", "H"] as const).map((label, index) => (
        <Slot key={label} x={8} y={12 + index * 28} label={label} />
      ))}

      <Line x1={64} y1={23} x2={86} y2={23} />
      <Line x1={64} y1={51} x2={86} y2={51} />
      <Line x1={86} y1={23} x2={86} y2={51} />
      <Line x1={86} y1={37} x2={108} y2={37} />
      <Slot x={108} y={26} label="1/4" />

      <Line x1={64} y1={79} x2={86} y2={79} />
      <Line x1={64} y1={107} x2={86} y2={107} />
      <Line x1={86} y1={79} x2={86} y2={107} />
      <Line x1={86} y1={93} x2={108} y2={93} />
      <Slot x={108} y={82} label="1/4" />

      <Line x1={64} y1={135} x2={86} y2={135} />
      <Line x1={64} y1={163} x2={86} y2={163} />
      <Line x1={86} y1={135} x2={86} y2={163} />
      <Line x1={86} y1={149} x2={108} y2={149} />
      <Slot x={108} y={138} label="1/4" />

      <Line x1={64} y1={191} x2={86} y2={191} />
      <Line x1={64} y1={219} x2={86} y2={219} />
      <Line x1={86} y1={191} x2={86} y2={219} />
      <Line x1={86} y1={205} x2={108} y2={205} />
      <Slot x={108} y={194} label="1/4" />

      <Line x1={164} y1={37} x2={186} y2={37} />
      <Line x1={164} y1={93} x2={186} y2={93} />
      <Line x1={186} y1={37} x2={186} y2={93} />
      <Line x1={186} y1={65} x2={208} y2={65} />
      <Slot x={208} y={54} label="1/2" />

      <Line x1={164} y1={149} x2={186} y2={149} />
      <Line x1={164} y1={205} x2={186} y2={205} />
      <Line x1={186} y1={149} x2={186} y2={205} />
      <Line x1={186} y1={177} x2={208} y2={177} />
      <Slot x={208} y={166} label="1/2" />

      <Line x1={264} y1={65} x2={286} y2={65} />
      <Line x1={264} y1={177} x2={286} y2={177} />
      <Line x1={286} y1={65} x2={286} y2={177} />
      <Line x1={286} y1={121} x2={308} y2={121} />
      <Slot x={308} y={94} w={72} label="Финал" />
      <Line x1={344} y1={116} x2={344} y2={168} strokeDasharray="3 3" strokeOpacity={0.4} />
      <Slot x={308} y={168} w={72} label="За 3-е" faint />
    </DiagramShell>
  );
}

function RoundRobinDiagram() {
  const players = ["A", "B", "C", "D"];
  const cell = 36;
  const origin = 48;
  return (
    <DiagramShell
      title="Эскиз круговой таблицы на 4 игроков"
      description="Каждый играет с каждым. В ячейках — условные очки за матч. Итог — сумма в правом столбце."
      viewBox="0 0 280 230"
    >
      {players.map((p, i) => (
        <text
          key={`r-${p}`}
          x={origin - 18}
          y={origin + i * cell + cell / 2 + 4}
          textAnchor="middle"
          fontSize={12}
          fill={ink}
          fillOpacity={0.75}
          style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
        >
          {p}
        </text>
      ))}
      {players.map((p, i) => (
        <text
          key={`c-${p}`}
          x={origin + i * cell + cell / 2}
          y={origin - 12}
          textAnchor="middle"
          fontSize={12}
          fill={ink}
          fillOpacity={0.75}
          style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
        >
          {p}
        </text>
      ))}
      <text
        x={origin + 4 * cell + cell / 2}
        y={origin - 12}
        textAnchor="middle"
        fontSize={11}
        fill={ink}
        fillOpacity={0.5}
        style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
      >
        Σ
      </text>

      {players.map((_, row) =>
        players.map((__, col) => {
          const x = origin + col * cell;
          const y = origin + row * cell;
          const self = row === col;
          const sample =
            row === 0 && col === 1
              ? "2"
              : row === 1 && col === 0
                ? "1"
                : row === 0 && col === 2
                  ? "2"
                  : row === 2 && col === 0
                    ? "1"
                    : row === 1 && col === 2
                      ? "2"
                      : row === 2 && col === 1
                        ? "1"
                        : self
                          ? "—"
                          : "";
          return (
            <g key={`${row}-${col}`}>
              <rect
                x={x}
                y={y}
                width={cell}
                height={cell}
                fill={self ? "none" : "none"}
                stroke={ink}
                strokeOpacity={self ? 0.2 : 0.4}
                strokeWidth={1}
              />
              {sample ? (
                <text
                  x={x + cell / 2}
                  y={y + cell / 2 + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fill={ink}
                  fillOpacity={self ? 0.3 : 0.8}
                  style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
                >
                  {sample}
                </text>
              ) : null}
            </g>
          );
        }),
      )}

      {[6, 5, 4, 3].map((sum, i) => (
        <g key={`sum-${i}`}>
          <rect
            x={origin + 4 * cell}
            y={origin + i * cell}
            width={cell}
            height={cell}
            fill="none"
            stroke={ink}
            strokeOpacity={0.55}
            strokeWidth={1}
          />
          <text
            x={origin + 4 * cell + cell / 2}
            y={origin + i * cell + cell / 2 + 4}
            textAnchor="middle"
            fontSize={12}
            fill={ink}
            fillOpacity={0.85}
            style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
          >
            {sum}
          </text>
        </g>
      ))}
    </DiagramShell>
  );
}

function GroupsPlayoffDiagram() {
  return (
    <DiagramShell
      title="Схема: две группы и выход в плей-офф"
      description="В группе — каждый с каждым. Двое лучших из каждой группы выходят в полуфинал, затем финал."
      viewBox="0 0 380 210"
    >
      <text
        x={40}
        y={18}
        fontSize={11}
        fill={ink}
        fillOpacity={0.55}
        style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
      >
        Группа A
      </text>
      <Slot x={16} y={28} w={48} label="A1" />
      <Slot x={72} y={28} w={48} label="A2" />
      <Slot x={16} y={58} w={48} label="A3" faint />
      <Slot x={72} y={58} w={48} label="A4" faint />

      <text
        x={40}
        y={118}
        fontSize={11}
        fill={ink}
        fillOpacity={0.55}
        style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
      >
        Группа B
      </text>
      <Slot x={16} y={128} w={48} label="B1" />
      <Slot x={72} y={128} w={48} label="B2" />
      <Slot x={16} y={158} w={48} label="B3" faint />
      <Slot x={72} y={158} w={48} label="B4" faint />

      <Line x1={120} y1={39} x2={160} y2={39} />
      <Line x1={120} y1={69} x2={148} y2={69} />
      <Line x1={148} y1={69} x2={148} y2={148} strokeDasharray="3 3" />
      <text
        x={134}
        y={100}
        fontSize={10}
        fill={ink}
        fillOpacity={0.45}
        textAnchor="middle"
        style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
      >
        выход
      </text>

      <Line x1={120} y1={139} x2={160} y2={139} />
      <Line x1={120} y1={169} x2={148} y2={169} />

      <Slot x={168} y={28} w={64} label="A1–B2" />
      <Slot x={168} y={128} w={64} label="B1–A2" />
      <text
        x={200}
        y={18}
        fontSize={11}
        fill={ink}
        fillOpacity={0.55}
        textAnchor="middle"
        style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
      >
        Полуфиналы
      </text>

      <Line x1={232} y1={39} x2={260} y2={39} />
      <Line x1={232} y1={139} x2={260} y2={139} />
      <Line x1={260} y1={39} x2={260} y2={139} />
      <Line x1={260} y1={89} x2={288} y2={89} />

      <Slot x={296} y={78} w={68} label="Финал" />
    </DiagramShell>
  );
}

function DoubleElimDiagram() {
  return (
    <DiagramShell
      title="Схема двойного выбывания"
      description="Верхняя сетка — без поражений. После первого проигрыша — в нижнюю. Второе поражение — вылет. Гранд-финал сводит победителей обеих сеток."
      viewBox="0 0 380 230"
    >
      <text
        x={8}
        y={16}
        fontSize={11}
        fill={ink}
        fillOpacity={0.55}
        style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
      >
        Верхняя сетка
      </text>
      <Slot x={8} y={28} w={48} label="A" />
      <Slot x={8} y={58} w={48} label="B" />
      <Slot x={8} y={96} w={48} label="C" />
      <Slot x={8} y={126} w={48} label="D" />

      <Line x1={56} y1={39} x2={76} y2={39} />
      <Line x1={56} y1={69} x2={76} y2={69} />
      <Line x1={76} y1={39} x2={76} y2={69} />
      <Line x1={76} y1={54} x2={96} y2={54} />
      <Slot x={96} y={43} w={56} label="W1" />

      <Line x1={56} y1={107} x2={76} y2={107} />
      <Line x1={56} y1={137} x2={76} y2={137} />
      <Line x1={76} y1={107} x2={76} y2={137} />
      <Line x1={76} y1={122} x2={96} y2={122} />
      <Slot x={96} y={111} w={56} label="W2" />

      <Line x1={152} y1={54} x2={172} y2={54} />
      <Line x1={152} y1={122} x2={172} y2={122} />
      <Line x1={172} y1={54} x2={172} y2={122} />
      <Line x1={172} y1={88} x2={192} y2={88} />
      <Slot x={192} y={77} w={64} label="Финал ↑" />

      <Line x1={124} y1={65} x2={124} y2={178} strokeDasharray="3 3" strokeOpacity={0.4} />
      <Line x1={124} y1={133} x2={124} y2={178} strokeDasharray="3 3" strokeOpacity={0.4} />

      <text
        x={8}
        y={172}
        fontSize={11}
        fill={ink}
        fillOpacity={0.55}
        style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
      >
        Нижняя сетка
      </text>
      <Slot x={8} y={182} w={56} label="L1" faint />
      <Slot x={72} y={182} w={56} label="L2" faint />
      <Line x1={128} y1={193} x2={152} y2={193} />
      <Slot x={152} y={182} w={64} label="Финал ↓" />

      <Line x1={256} y1={88} x2={280} y2={88} />
      <Line x1={216} y1={193} x2={280} y2={193} />
      <Line x1={280} y1={88} x2={280} y2={193} />
      <Line x1={280} y1={140} x2={300} y2={140} />
      <Slot x={300} y={129} w={72} label="Гранд" />
    </DiagramShell>
  );
}

const DIAGRAMS: Record<TournamentFormat, () => ReactNode> = {
  olympic: OlympicDiagram,
  round_robin: RoundRobinDiagram,
  groups_playoff: GroupsPlayoffDiagram,
  double_elimination: DoubleElimDiagram,
};

export function FormatDiagram({ format }: { format: TournamentFormat }) {
  const Diagram = DIAGRAMS[format];
  return <Diagram />;
}

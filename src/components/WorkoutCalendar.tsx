import { useMemo } from "react";
import { getWorkoutLogs } from "@/services/workoutService";

interface WorkoutCalendarProps {
  compact?: boolean;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function WorkoutCalendar({ compact }: WorkoutCalendarProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const logs = getWorkoutLogs();

  const completedDates = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      const d = new Date(l.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        set.add(String(d.getDate()));
      }
    });
    return set;
  }, [logs, year, month]);

  const lastMonthCount = useMemo(() => {
    const lastMonth = month === 0 ? 11 : month - 1;
    const lastYear = month === 0 ? year - 1 : year;
    return logs.filter((l) => {
      const d = new Date(l.date);
      return d.getFullYear() === lastYear && d.getMonth() === lastMonth;
    }).length;
  }, [logs, year, month]);

  const thisMonthCount = completedDates.size;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const shortMonth = `${MONTH_NAMES[month].slice(0, MONTH_NAMES[month].length > 4 ? 3 : MONTH_NAMES[month].length)}`;
  const label = `${shortMonth} '${String(year).slice(2)}`;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-card rounded-2xl p-4 space-y-3">
      <h3 className="text-foreground font-semibold text-base">{label}</h3>
      <div className="border-t border-border" />

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="text-[10px] text-muted-foreground font-medium">{d}</span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />;
          const isToday = day === today;
          const isCompleted = completedDates.has(String(day));

          return (
            <div key={i} className="relative flex flex-col items-center justify-center py-1">
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors
                  ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}
                `}
              >
                {day}
              </span>
              {isCompleted && !isToday && (
                <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              {isCompleted && isToday && (
                <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-primary-foreground" />
              )}
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="border-t border-border pt-3 flex justify-around text-center">
        <div>
          <p className="text-lg font-bold text-foreground">{lastMonthCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Last Month</p>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{thisMonthCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">This Month</p>
        </div>
      </div>
    </div>
  );
}

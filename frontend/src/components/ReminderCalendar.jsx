import { useState, useEffect } from 'react';
import { tasksService } from '../services/tasksService';
import { useAuth } from '../contexts/AuthContext';

const ReminderCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [completedTasks, setCompletedTasks] = useState({});
  const [loading, setLoading] = useState(false);

  const loadTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const result = await tasksService.getTasks(month, year);
      
      const tasksMap = {};
      result.data.forEach(task => {
        const dateStr = task.taskDate.split('T')[0];
        tasksMap[`${task.taskType}_${dateStr}`] = task.completed;
      });
      
      setCompletedTasks(tasksMap);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user, currentDate]);

  const getDateString = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date) => {
    const today = new Date();
    return getDateString(date) === getDateString(today);
  };

  const isTuesday = (date) => {
    return date.getDay() === 2; // Tuesday = 2
  };

  const isDailyTaskCompleted = (date) => {
    const dateStr = getDateString(date);
    return completedTasks[`daily_${dateStr}`] || false;
  };

  const isWeeklyTaskCompleted = (date) => {
    const dateStr = getDateString(date);
    return completedTasks[`weekly_${dateStr}`] || false;
  };

  const markTask = async (taskType, date) => {
    if (!user) return;
    
    try {
      const dateStr = getDateString(date);
      await tasksService.markTask(taskType, dateStr);
      
      setCompletedTasks(prev => ({
        ...prev,
        [`${taskType}_${dateStr}`]: true
      }));
    } catch (error) {
      console.error('Erro ao marcar tarefa:', error);
    }
  };

  const handleDailyClick = (date) => {
    if (isToday(date)) {
      window.open('https://csgo-skins.com/', '_blank');
    } else {
      toggleTask('daily', date);
    }
  };

  const handleWeeklyClick = (date) => {
    if (isTuesday(date)) {
      toggleTask('weekly', date);
    }
  };

  const toggleTask = async (taskType, date) => {
    if (!user) return;
    
    try {
      const dateStr = getDateString(date);
      const isCompleted = completedTasks[`${taskType}_${dateStr}`] || false;
      
      await tasksService.markTask(taskType, dateStr);
      
      setCompletedTasks(prev => ({
        ...prev,
        [`${taskType}_${dateStr}`]: !isCompleted
      }));
    } catch (error) {
      console.error('Erro ao alternar tarefa:', error);
    }
  };

  const getLastTuesday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    let daysToSubtract;
    
    if (dayOfWeek === 2) { // Hoje é terça
      daysToSubtract = 0;
    } else if (dayOfWeek > 2) { // Depois da terça
      daysToSubtract = dayOfWeek - 2;
    } else { // Antes da terça (dom = 0, seg = 1)
      daysToSubtract = dayOfWeek + 5; // Terça passada
    }
    
    const lastTuesday = new Date(today);
    lastTuesday.setDate(today.getDate() - daysToSubtract);
    return lastTuesday;
  };

  const getWeekNumber = (date) => {
    // Encontrar a terça-feira da semana para esta data
    const dayOfWeek = date.getDay();
    let daysToTuesday;
    
    if (dayOfWeek === 2) { // Terça
      daysToTuesday = 0;
    } else if (dayOfWeek > 2) { // Depois da terça (qua, qui, sex, sab, dom, seg)
      daysToTuesday = dayOfWeek - 2;
    } else { // Antes da terça (dom = 0, seg = 1)
      daysToTuesday = dayOfWeek + 5; // Terça passada
    }
    
    const tuesdayOfWeek = new Date(date);
    tuesdayOfWeek.setDate(date.getDate() - daysToTuesday);
    
    // Usar uma data de referência fixa (terça-feira, 2 de janeiro de 2024)
    const referenceDate = new Date(2024, 0, 2); // 2 de janeiro de 2024 (terça)
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysDiff = Math.floor((tuesdayOfWeek.getTime() - referenceDate.getTime()) / msPerDay);
    
    // Calcular quantas semanas se passaram desde a referência
    const weekNumber = Math.floor(daysDiff / 7);
    
    // Retornar o número da cor (0-4)
    return weekNumber % 5;
  };

  const getTuesdayOfWeek = (date) => {
    const dayOfWeek = date.getDay();
    let daysToTuesday;
    
    if (dayOfWeek === 2) {
      daysToTuesday = 0;
    } else if (dayOfWeek > 2) {
      daysToTuesday = dayOfWeek - 2;
    } else {
      daysToTuesday = dayOfWeek + 5;
    }
    
    const tuesdayOfWeek = new Date(date);
    tuesdayOfWeek.setDate(date.getDate() - daysToTuesday);
    return tuesdayOfWeek;
  };

  const isWeekCompleted = (date) => {
    const tuesday = getTuesdayOfWeek(date);
    const tuesdayStr = getDateString(tuesday);
    return completedTasks[`weekly_${tuesdayStr}`] || false;
  };

  const getWeekColors = (weekNumber, isCompleted = false) => {
    const baseColors = [
      {
        bg: 'bg-purple-500',
        bgLight: 'bg-purple-500/10',
        bgHover: 'hover:bg-purple-500/20',
        border: 'border-purple-500',
        borderLight: 'border-purple-500/30',
        borderHover: 'hover:border-purple-400',
        indicator: 'bg-purple-400',
        text: 'text-purple-400',
        completedBg: 'bg-purple-200',
        completedBgLight: 'bg-purple-200/30',
        completedBorder: 'border-purple-200',
        completedBorderLight: 'border-purple-200/60'
      },
      {
        bg: 'bg-blue-500',
        bgLight: 'bg-blue-500/10',
        bgHover: 'hover:bg-blue-500/20',
        border: 'border-blue-500',
        borderLight: 'border-blue-500/30',
        borderHover: 'hover:border-blue-400',
        indicator: 'bg-blue-400',
        text: 'text-blue-400',
        completedBg: 'bg-blue-200',
        completedBgLight: 'bg-blue-200/30',
        completedBorder: 'border-blue-200',
        completedBorderLight: 'border-blue-200/60'
      },
      {
        bg: 'bg-green-500',
        bgLight: 'bg-green-500/10',
        bgHover: 'hover:bg-green-500/20',
        border: 'border-green-500',
        borderLight: 'border-green-500/30',
        borderHover: 'hover:border-green-400',
        indicator: 'bg-green-400',
        text: 'text-green-400',
        completedBg: 'bg-green-200',
        completedBgLight: 'bg-green-200/30',
        completedBorder: 'border-green-200',
        completedBorderLight: 'border-green-200/60'
      },
      {
        bg: 'bg-orange-500',
        bgLight: 'bg-orange-500/10',
        bgHover: 'hover:bg-orange-500/20',
        border: 'border-orange-500',
        borderLight: 'border-orange-500/30',
        borderHover: 'hover:border-orange-400',
        indicator: 'bg-orange-400',
        text: 'text-orange-400',
        completedBg: 'bg-orange-200',
        completedBgLight: 'bg-orange-200/30',
        completedBorder: 'border-orange-200',
        completedBorderLight: 'border-orange-200/60'
      },
      {
        bg: 'bg-pink-500',
        bgLight: 'bg-pink-500/10',
        bgHover: 'hover:bg-pink-500/20',
        border: 'border-pink-500',
        borderLight: 'border-pink-500/30',
        borderHover: 'hover:border-pink-400',
        indicator: 'bg-pink-400',
        text: 'text-pink-400',
        completedBg: 'bg-pink-200',
        completedBgLight: 'bg-pink-200/30',
        completedBorder: 'border-pink-200',
        completedBorderLight: 'border-pink-200/60'
      }
    ];
    
    const colorSet = baseColors[weekNumber % 5];
    
    if (isCompleted) {
      return {
        ...colorSet,
        bgLight: colorSet.bg + '/20',
        borderLight: colorSet.border,
        bgHover: 'hover:' + colorSet.bg + '/30'
      };
    }
    
    return colorSet;
  };


  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior para completar a primeira semana
    for (let i = 0; i < startingDay; i++) {
      const prevDate = new Date(year, month, -startingDay + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateToLastTuesday = () => {
    const lastTuesday = getLastTuesday();
    setCurrentDate(new Date(lastTuesday.getFullYear(), lastTuesday.getMonth(), 1));
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-slate-800 p-3 sm:p-6 rounded-none sm:rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h3 className="text-lg sm:text-xl font-bold text-cs-orange">Lembretes CS:GO</h3>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={navigateToLastTuesday}
            className="px-2 sm:px-3 py-1 text-xs text-purple-400 hover:text-white hover:bg-purple-600/20 border border-purple-500/30 rounded transition-colors"
            title="Ir para a última terça-feira"
          >
            <span className="hidden sm:inline">Última Terça</span>
            <span className="sm:hidden">Terça</span>
          </button>
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
          >
            ←
          </button>
          <span className="text-white font-medium min-w-[120px] sm:min-w-[150px] text-center text-sm sm:text-base">
            <span className="hidden sm:inline">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            <span className="sm:hidden">{monthNames[currentDate.getMonth()].substring(0, 3)} {currentDate.getFullYear()}</span>
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Legenda */}
      <div className="mb-3 sm:mb-4 space-y-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-slate-300">Caixa Diária</span>
        </div>
        
        {/* Mimo Semanal com cores alternadas */}
        <div className="space-y-1">
          <span className="text-slate-300 block sm:inline">Semanas do Mimo Semanal:</span>
          <span className="text-slate-300 hidden sm:inline"> (Terça a Segunda)</span>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-0 sm:ml-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-slate-400 text-xs">Semana 1</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-slate-400 text-xs">Semana 2</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-400 text-xs">Semana 3</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-slate-400 text-xs">Semana 4</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
              <span className="text-slate-400 text-xs">Semana 5</span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-slate-400 mt-2">
          <span className="block sm:inline">💡 Toda a semana tem a mesma cor.</span>
          <span className="hidden sm:inline"> (Terça a Segunda) tem a mesma cor para mostrar o período do mimo semanal.</span><br className="hidden sm:block"/>
          <span className="block sm:inline">🖱️ Clique na terça para marcar o mimo.</span>
          <span className="hidden sm:inline"> diretamente na terça-feira para marcar/desmarcar o mimo concluído.</span>
        </div>
      </div>

      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-slate-400 text-xs sm:text-sm font-medium p-1 sm:p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendário */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, isCurrentMonth }, index) => {
          const todayDate = isToday(date);
          const tuesdayDate = isTuesday(date);
          const dailyCompleted = isDailyTaskCompleted(date);
          const weeklyCompleted = isWeeklyTaskCompleted(date);
          
          // Obter cores da semana para qualquer dia
          const weekNumber = getWeekNumber(date);
          const weekCompleted = isWeekCompleted(date);
          const weekColors = getWeekColors(weekNumber, weekCompleted);

          return (
            <div
              key={index}
              onClick={() => {
                if (isCurrentMonth && tuesdayDate) {
                  toggleTask('weekly', date);
                }
              }}
              className={`
                relative p-1 sm:p-2 text-center text-xs sm:text-sm border rounded transition-colors
                ${isCurrentMonth ? 'text-white' : 'text-slate-500'}
                ${todayDate ? 'bg-cs-orange/20 border-cs-orange' : 
                  isCurrentMonth ? `${weekColors.bgLight} ${weekColors.borderLight}` :
                  'bg-slate-700 border-slate-600'}
                ${isCurrentMonth && tuesdayDate ? `cursor-pointer ${weekColors.bgHover} ${weekColors.borderHover}` : 
                  isCurrentMonth ? `${weekColors.bgHover}` : 'hover:bg-slate-600'}
              `}
              title={tuesdayDate && isCurrentMonth ? 
                `Clique para ${weeklyCompleted ? 'desmarcar' : 'marcar'} mimo semanal - ${date.getDate()}/${date.getMonth() + 1}` : 
                isCurrentMonth ? `Semana do mimo semanal - ${date.getDate()}/${date.getMonth() + 1}` : 
                ''}
            >
              <span className="block text-xs sm:text-sm">{date.getDate()}</span>
              
              {/* Indicadores de tarefas */}
              <div className="flex justify-center gap-1 mt-1">
                {/* Caixa diária */}
                {isCurrentMonth && (
                  <div
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-2 flex items-center justify-center transition-colors ${
                      dailyCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : todayDate 
                          ? 'bg-transparent border-green-500 hover:bg-green-500/20' 
                          : 'bg-transparent border-green-500/50'
                    }`}
                    title={`Caixa diária ${dailyCompleted ? 'concluída' : 'pendente'} - ${date.getDate()}/${date.getMonth() + 1}`}
                  >
                    {dailyCompleted && (
                      <span className="text-[6px] sm:text-[8px] font-bold">✓</span>
                    )}
                  </div>
                )}
                
                {/* Mimo semanal (terças) */}
                {isCurrentMonth && tuesdayDate && (
                  <div
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-2 flex items-center justify-center transition-colors ${
                      weeklyCompleted 
                        ? `${weekColors.bg} ${weekColors.border} text-white` 
                        : `bg-transparent ${weekColors.border} ${weekColors.bgHover}/50`
                    }`}
                    title={`Mimo semanal ${weeklyCompleted ? 'concluído' : 'pendente'} - ${date.getDate()}/${date.getMonth() + 1}`}
                  >
                    {weeklyCompleted && (
                      <span className="text-[6px] sm:text-[8px] font-bold">✓</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Indicador visual extra para terças clicáveis */}
              {isCurrentMonth && tuesdayDate && (
                <div className={`absolute top-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 ${weekColors.indicator} rounded-full opacity-60`}></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Checklist de Tarefas */}
      <div className="mt-4 sm:mt-6">
        {/* Tarefa Diária */}
        <div className="bg-slate-700 p-3 sm:p-4 rounded-lg">
          <h4 className="text-white font-medium mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            Caixa Diária
          </h4>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-xs sm:text-sm">Pegar caixa no CSGOSkins</span>
              <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded ${
                isDailyTaskCompleted(new Date()) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isDailyTaskCompleted(new Date()) ? '✓ Concluída' : '✗ Pendente'}
              </span>
            </div>
            
            <div className="space-y-2">
              {!isDailyTaskCompleted(new Date()) ? (
                <button
                  onClick={() => toggleTask('daily', new Date())}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 sm:px-4 rounded font-medium transition-colors text-sm"
                  disabled={loading}
                >
                  ✅ Marcar como Concluída
                </button>
              ) : (
                <button
                  onClick={() => toggleTask('daily', new Date())}
                  className="w-full bg-slate-600 hover:bg-slate-500 text-white py-2 px-3 sm:px-4 rounded font-medium transition-colors text-sm"
                  disabled={loading}
                >
                  ↩️ Desmarcar
                </button>
              )}
              
              <button
                onClick={() => window.open('https://csgo-skins.com/', '_blank')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 sm:px-4 rounded font-medium transition-colors text-sm"
              >
                🌐 Ir ao CSGOSkins
              </button>
            </div>
            
            <p className="text-xs text-slate-400 text-center">
              {isDailyTaskCompleted(new Date()) 
                ? '✓ Caixa coletada hoje!' 
                : 'Marque como concluída.'}
              <span className="hidden sm:inline">
                {isDailyTaskCompleted(new Date()) 
                  ? ' Use "Ir ao CSGOSkins" se precisar acessar o site.' 
                  : ' e use o botão azul para ir ao site.'}
              </span>
            </p>
          </div>
        </div>

        {/* Instruções para Mimo Semanal */}
        <div className="bg-slate-700 p-3 sm:p-4 rounded-lg mt-3 sm:mt-4">
          <h4 className="text-white font-medium mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 rounded-full"></div>
            Mimo Semanal
          </h4>
          <p className="text-slate-300 text-xs sm:text-sm mb-2">
            💡 Clique nas <strong>terças</strong> no calendário para marcar o mimo.
            <span className="hidden sm:inline"> diretamente nas <strong>terças-feiras</strong> no calendário acima para marcar/desmarcar o mimo semanal.</span>
          </p>
          <p className="text-slate-400 text-xs">
            <span className="block sm:hidden">• Terças têm ponto roxo no canto</span>
            <span className="block sm:hidden">• Círculo mostra se foi coletado (✓)</span>
            <span className="hidden sm:block">• As terças clicáveis têm um pequeno ponto roxo no canto superior direito<br/>
            • Passe o mouse sobre as terças para ver a ação disponível<br/>
            • O círculo roxo mostra se o mimo foi coletado (✓) ou está pendente (vazio)</span>
          </p>
        </div>
      </div>

      {/* Status Resumo */}
      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-slate-700/50 rounded-lg border border-slate-600">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm gap-2 sm:gap-0">
          <span className="text-slate-300">Status de Hoje:</span>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className={`flex items-center gap-1 ${
              isDailyTaskCompleted(new Date()) ? 'text-green-400' : 'text-slate-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isDailyTaskCompleted(new Date()) ? 'bg-green-500' : 'bg-slate-500'
              }`}></div>
              Caixa: {isDailyTaskCompleted(new Date()) ? 'OK' : 'Pendente'}
            </span>
            {isTuesday(new Date()) && (
              <span className={`flex items-center gap-1 ${
                isWeeklyTaskCompleted(new Date()) ? 'text-purple-400' : 'text-slate-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isWeeklyTaskCompleted(new Date()) ? 'bg-purple-500' : 'bg-slate-500'
                }`}></div>
                Mimo: {isWeeklyTaskCompleted(new Date()) ? 'OK' : 'Pendente'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderCalendar;
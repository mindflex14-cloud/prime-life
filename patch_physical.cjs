const fs = require('fs');
let content = fs.readFileSync('src/components/BiologicalCommand/PhysicalActivity.tsx', 'utf8');

const completeFunc = `  const completeWorkout = () => {
    setDailyWorkout(prev => prev ? { ...prev, isCompleted: true } : prev);
  };
`;

content = content.replace('const handleSetComplete = (exerciseId: string) => {', completeFunc + '\n  const handleSetComplete = (exerciseId: string) => {');

content = content.replace('<button className={`w-full py-4', '<button onClick={completeWorkout} disabled={dailyWorkout?.isCompleted} className={`w-full py-4');

content = content.replace('Complete Workout', '{dailyWorkout?.isCompleted ? "Workout Completed" : "Complete Workout"}');

fs.writeFileSync('src/components/BiologicalCommand/PhysicalActivity.tsx', content);

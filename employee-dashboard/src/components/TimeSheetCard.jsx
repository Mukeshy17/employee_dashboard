import { useState } from "react";

export default function TimeSheetCard({dailyworks, onAddRecord}) {
  const [task, setTask] = useState("");
  const [hours, setHours] = useState("");
 

  const handleAddRecord = () => {
    if (!task || !hours) return;

    const newRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      task,
      hours,
    };

    onAddRecord(newRecord);
    setTask("");
    setHours("");
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-xl">
      <h2 className="text-xl font-bold mb-4">Daily Timesheet</h2>

      {/* Input Section */}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Work Description"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <input
          type="number"
          placeholder="Hours Worked"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <button
          onClick={handleAddRecord}
          className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Add Record
        </button>
      </div>

      {/* Records Table */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Work Records</h3>

        {dailyworks.length === 0 ? (
          <p className="text-gray-500 text-sm">No records added</p>
        ) : (
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Task</th>
                <th className="border px-2 py-1">Hours</th>
              </tr>
            </thead>
            <tbody>
              {dailyworks.map((rec) => (
                <tr key={rec.date}>
                  <td className="border px-2 py-1">{rec.date}</td>
                  <td className="border px-2 py-1">{rec.task}</td>
                  <td className="border px-2 py-1">{rec.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

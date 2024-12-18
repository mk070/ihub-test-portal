import { X } from 'lucide-react';

const AddQuestionModal = ({ isOpen, onClose, formData, onChange, onSubmit, uploadStatus }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-8 max-h-[90vh] overflow-y-auto transform transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Add New Question</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Question <span className="text-red-500">*</span>
            </label>
            <textarea
              name="question"
              value={formData.question}
              onChange={onChange}
              className="w-full p-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
              rows={4}
              required
            />
          </div>

          {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
            <div key={optionKey}>
              <label className="block text-sm font-medium text-black mb-2">
                Option {index + 1} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name={optionKey}
                value={formData[optionKey]}
                onChange={onChange}
                className="w-full p-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                required
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Correct Answer <span className="text-red-500">*</span>
            </label>
            <select
              name="answer"
              value={formData.answer}
              onChange={onChange}
              className="w-full p-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
              required
            >
              <option value="">Select Correct Answer</option>
              {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
                formData[optionKey] && (
                  <option key={optionKey} value={formData[optionKey]}>
                    Option {index + 1}: {formData[optionKey]}
                  </option>
                )
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Difficulty Level <span className="text-red-500">*</span>
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={onChange}
              className="w-full p-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
              required
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={onChange}
              className="w-full p-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
              placeholder="e.g., math, algebra, geometry"
            />
            <p className="mt-1 text-sm text-gray-500">Separate tags with commas</p>
          </div>

          {uploadStatus && (
            <div
              className={`p-4 rounded-lg text-sm font-medium text-center shadow-sm ${
                uploadStatus.startsWith("Success")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {uploadStatus}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Add Question
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionModal;
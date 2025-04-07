import React from "react";

interface ManualImageUploadProps {
  filename: string;
  visible: boolean;
  onClose: () => void;
}

const ManualImageUpload: React.FC<ManualImageUploadProps> = ({
  filename,
  visible,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
        <h2 className="text-xl font-bold mb-4">Manual Image Upload Required</h2>

        <div className="prose prose-sm mb-4">
          <p className="text-yellow-600 font-medium">
            Due to Netlify's serverless function limitations, we can't
            automatically save uploaded images.
          </p>

          <p>To complete this upload, please follow these steps:</p>

          <ol className="list-decimal pl-5 space-y-2">
            <li>Download your image to your local computer</li>
            <li>
              Save it with exactly this filename:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">{filename}</code>
            </li>
            <li>
              Add the file to your git repository in the{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                public/uploads/
              </code>{" "}
              folder
            </li>
            <li>Commit and push the changes to deploy the image</li>
          </ol>

          <p className="text-gray-700 italic mt-2">
            The image URL has been saved in the database, but the actual file
            needs to be manually uploaded.
          </p>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualImageUpload;

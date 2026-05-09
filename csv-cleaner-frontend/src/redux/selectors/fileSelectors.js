// redux/selectors/fileSelectors.js
export const selectCurrentFile = (state) => state.files.currentFile;
export const selectUploadStatus = (state) => state.files.uploadStatus;
export const selectUploadError = (state) => state.files.uploadError;
export const selectUploadProgress = (state) => state.files.uploadProgress;
export const selectUploadedFiles = (state) => state.files.uploadedFiles;
export function validateUploadFile(file?: Express.Multer.File) {
  const errors: string[] = [];

  if (!file) {
    errors.push("file is required");
  }

  return errors;
}
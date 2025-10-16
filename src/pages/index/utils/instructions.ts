const defaultInstructions = (languageName: string, shortName: string) => [
  `Tulis program ${languageName} sesuai kebutuhan latihan.`,
  `Pastikan program menghasilkan output ${shortName} sesuai spesifikasi soal.`,
  `Tekan <strong>Run</strong> untuk mengirim kode ${shortName} ke server agar dijalankan (proxy Judge0) dan lihat hasilnya di panel Output.`,
];

const assemblyInstructions = (languageName: string) => [
  `Tulis program ${languageName} dengan sintaks NASM.`,
  "Pastikan program menghasilkan output melalui syscall yang sesuai.",
  "Tekan <strong>Run</strong> untuk mengirim kode Assembly ke server agar dijalankan (proxy Judge0) dan lihat hasilnya di panel Output.",
];

export const resolveInstructions = (languageName: string, shortName: string) => {
  if (shortName === "Assembly") {
    return assemblyInstructions(languageName);
  }

  return defaultInstructions(languageName, shortName);
};

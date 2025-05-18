// Interface para o Tizen filesystem
declare global {
  interface Window {
    tizen: {
      filesystem: {
        listStorages: (
          successCallback: (storages: Storage[]) => void,
          errorCallback?: (error: Error) => void
        ) => void;
        resolve: (
          location: string,
          successCallback: (dir: Directory) => void,
          errorCallback?: (error: Error) => void,
          mode?: string
        ) => void;
      };
    };
  }
}

interface Storage {
  label: string;
  type: string;
  state: string;
}

interface Directory {
  listFiles: (
    successCallback: (files: File[]) => void,
    errorCallback?: (error: Error) => void
  ) => void;
}

interface File {
  name: string;
  fullPath: string;
}

class StorageService {
  private static instance: StorageService;
  private videoStoragePath: string | null = null;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async initialize(): Promise<void> {
    // Se não estiver em ambiente Tizen, usa o caminho padrão
    if (!window.tizen) {
      this.videoStoragePath = 'D:/KARAOKEV3/musicas';
      return;
    }

    return new Promise((resolve, reject) => {
      window.tizen.filesystem.listStorages((storages) => {
        // Procura por dispositivos USB
        const usbStorage = storages.find(storage => 
          storage.type === 'EXTERNAL' && 
          storage.state === 'MOUNTED' &&
          storage.label.startsWith('removable_')
        );

        if (!usbStorage) {
          reject(new Error('Nenhum dispositivo USB encontrado'));
          return;
        }

        // Resolve o caminho do dispositivo USB
        window.tizen.filesystem.resolve(
          usbStorage.label,
          (dir) => {
            // Lista os arquivos/pastas para encontrar a pasta KARAOKEV3
            dir.listFiles(
              (files) => {
                const karaokeDir = files.find(file => file.name === 'KARAOKEV3');
                if (karaokeDir) {
                  this.videoStoragePath = `${karaokeDir.fullPath}/musicas`;
                  resolve();
                } else {
                  reject(new Error('Pasta KARAOKEV3 não encontrada no dispositivo USB'));
                }
              },
              (error) => reject(new Error(`Erro ao listar arquivos: ${error.message}`))
            );
          },
          (error) => reject(new Error(`Erro ao resolver caminho: ${error.message}`))
        );
      }, (error) => reject(new Error(`Erro ao listar storages: ${error.message}`)));
    });
  }

  getVideoPath(videoFileName: string): string {
    if (!this.videoStoragePath) {
      throw new Error('Storage não inicializado. Chame initialize() primeiro.');
    }
    return `${this.videoStoragePath}/${videoFileName}`;
  }

  isInitialized(): boolean {
    return this.videoStoragePath !== null;
  }
}

export const storageService = StorageService.getInstance(); 
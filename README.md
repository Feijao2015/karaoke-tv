# Karaoke TV App

Aplicativo de Karaokê otimizado para Samsung TV (Tizen) que exibe a fila de músicas, reproduz vídeos do YouTube e mostra classificações em tempo real.

## Requisitosss

- Node.js 18+
- Conta no Supabase
- Aplicativo móvel para gerenciamento de músicas

## Configuração

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/karaoke-tv.git
cd karaoke-tv
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
REACT_APP_SUPABASE_URL=sua_url_do_supabase
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Inicie o servidor de desenvolvimento:
```bash
npm start
```

## Estrutura do Banco de Dados (Supabase)

### Tabela: queue_songs
- id: uuid (primary key)
- title: text
- singer_name: text
- youtube_url: text
- created_at: timestamp

### Tabela: rankings
- id: uuid (primary key)
- singer_name: text
- song_title: text
- score: integer
- created_at: timestamp

## Otimizações para TV

- Interface adaptada para telas grandes
- Fontes maiores e legíveis
- Navegação otimizada para controle remoto
- Áreas seguras para diferentes tipos de TV
- Feedback visual claro para seleção
- Animações suaves

## Recursos

- Exibição da fila de músicas em tempo real
- Reprodução de vídeos do YouTube
- Sistema de pontuação
- Classificação dos cantores
- Animações de pontuação
- Sincronização em tempo real com Supabase

## Desenvolvimento

O projeto usa as seguintes tecnologias:

- React 18
- TypeScript
- Tailwind CSS
- React Query
- Supabase
- YouTube Player API

## Licença

MIT

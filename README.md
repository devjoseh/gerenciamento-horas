# Gerenciamento de Horas

O Gerenciamento de Horas é uma aplicação web desenvolvida para facilitar o registro e acompanhamento de horas dedicadas a diferentes tarefas. Com uma interface intuitiva e funcionalidades robustas, a ferramenta permite que os usuários organizem suas atividades de forma eficiente, enquanto os administradores têm acesso a recursos avançados para gerenciamento de áreas e geração de relatórios.

## Funcionalidades

- **Gerenciamento de Tarefas:** Crie, edite e visualize tarefas de forma simples e rápida.
- **Controle de Sessões:** Inicie e pare sessões de trabalho para registrar o tempo dedicado a cada tarefa.
- **Geração de Relatórios:** Ferramenta para extrair dados detalhados sobre as horas trabalhadas, ideal para análise de produtividade e faturamento.

## Tecnologias Utilizadas

- **Next.js:** Framework React para renderização no lado do servidor e construção de interfaces de usuário.
- **TypeScript:** Superset do JavaScript que adiciona tipagem estática para um desenvolvimento mais seguro e escalável.
- **Tailwind CSS:** Framework de CSS utilitário para estilização rápida e customizável.
- **Supabase:** Plataforma de backend como serviço (BaaS) que oferece banco de dados, autenticação e APIs em tempo real.
- **Shadcn/ui:** Coleção de componentes de UI reutilizáveis.

## Instalação e Execução

Siga os passos abaixo para configurar e executar o projeto em seu ambiente de desenvolvimento local.

### Pré-requisitos

- **Node.js:** Versão 18.x ou superior.
- **npm** ou **yarn:** Gerenciador de pacotes.

### Configuração do Ambiente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/devjoseh/gerenciamento-horas.git
   cd gerenciamento-horas
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente:**
   - Renomeie o arquivo `.env.example` para `.env`.
   - Abra o arquivo `.env` e adicione as credenciais do seu projeto Supabase:
     ```env
      SUPABASE_URL=
      SUPABASE_ANON_KEY=
      SUPABASE_SERVICE_ROLE_KEY=
     ```
   - Você pode encontrar essas informações nas configurações do seu projeto no painel da Supabase.

### Configuração do Banco de Dados

Para configurar o banco de dados, execute o script SQL fornecido no projeto.

1. **Acesse o painel da Supabase:**
   - Faça login na sua conta da Supabase e navegue até o seu projeto.

2. **Editor de SQL:**
   - No menu lateral, clique em "SQL Editor".
   - Clique em "New query" e cole o conteúdo do arquivo `utils/schemas/01-setup-db.sql`.
   - Clique em "Run" para executar o script e criar as tabelas necessárias.

### Executando a Aplicação

Com o ambiente e o banco de dados configurados, você pode iniciar a aplicação.

1. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

2. **Acesse a aplicação:**
   - Abra seu navegador e acesse [http://localhost:3000](http://localhost:3000).

Agora você está pronto para explorar todas as funcionalidades do Gerenciamento de Horas!

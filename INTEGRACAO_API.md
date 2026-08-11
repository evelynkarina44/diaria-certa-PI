# Integração com a API Diária Certa

## Configuração

Crie um arquivo `.env` a partir de `.env.example`:

```dotenv
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000
```

Em dispositivo físico, não use `localhost`: informe o IP da máquina que
executa o backend. No emulador Android, a aplicação usa
`http://10.0.2.2:3000` como fallback quando a variável não foi definida.

O token JWT é armazenado com Expo SecureStore no Android/iOS e enviado pelo
interceptor Axios como `Authorization: Bearer TOKEN`. Na versão web, a sessão
fica somente em memória; o projeto não utiliza `localStorage`.

## Services disponíveis

Os arquivos em `src/services` refletem somente rotas existentes:

- autenticação e usuários;
- clientes e diaristas;
- endereços e catálogo de serviços;
- serviços da diarista;
- combos e serviços dos combos;
- disponibilidade;
- agendamentos e estimativa;
- itens de serviço do agendamento, somente leitura;
- check-in, confirmação de pagamento e check-out;
- avaliações;
- favoritos, sem operação de atualização;
- denúncias e ocorrências.

## Telas conectadas

- Login: autenticação, persistência do token e direcionamento conforme perfil.
- Encontrar diarista: busca, avaliação/preço, catálogo e favoritos.
- Perfil da diarista: perfil público e serviços oferecidos.
- Home da diarista: próximas diárias e acesso às solicitações.
- Solicitações: listagem, aceite e recusa.
- Histórico do cliente: agendamentos históricos e favoritos.
- Histórico da diarista: agendamentos históricos.
- Perfil do cliente: usuário e endereço da sessão.
- Perfil profissional: usuário, descrição e avaliação.
- Check-in da diarista: consulta da diária e solicitação.
- Check-in do cliente: confirmação de pagamento e início do serviço.
- Avaliação e denúncia: envio quando a tela recebe os identificadores exigidos.

## Funcionalidades sem integração completa

Não foram criadas rotas ou respostas fictícias para estes pontos:

- recuperação de senha;
- cadastro e armazenamento de cartões;
- geração, cópia ou acompanhamento de pagamento Pix;
- chat e notificações;
- upload de imagens da residência ou de anexos da denúncia;
- cálculo/filtro de distância em quilômetros;
- filtro por múltiplos serviços em uma única busca;
- calendário mensal agregado;
- interface para realizar check-out;
- cadastro completo de cliente e diarista.

As telas de cadastro atuais não coletam todos os campos obrigatórios da API.
Faltam, entre outros, telefone no usuário; data de nascimento, quantidade de
cômodos e tamanho da casa no cliente; e quantidade máxima de cômodos na
diarista. Esses formulários não enviam dados incompletos nem inventam valores.

O fluxo de agendamento também ainda precisa de seletores reais de endereço,
serviços, quantidade de cômodos, tamanho da residência e horário final antes de
poder chamar com segurança a estimativa e a criação do backend.

 1. Eliminação de Código Duplicado
Foi identificado que as funções `createTask` e `updateTask` repetiam a mesma lógica de validação, controle de estado (`submitting`) e tratamento de erros.

Para resolver isso, foram criadas funções auxiliares:
`validateTask()`: responsável por validar os dados da tarefa.
`executeSubmit()`: responsável por controlar o processo de envio e tratamento de erros.

Isso reduziu a repetição de código e facilitou a manutenção.

 2. Função de Requisição Genérica
As funções do hook realizavam chamadas `fetch` muito parecidas.
Foi criada a função `apiRequest()`, responsável por:

 Fazer a requisição HTTP;
 Verificar erros da resposta;
Retornar os dados da API.

Com isso, todas as operações passaram a reutilizar a mesma lógica de comunicação com o servidor.

 3. Uso de useCallback
As funções eram recriadas sempre que o componente renderizava.

Para evitar isso, as funções:
 `fetchTasks`
 `createTask`
 `updateTask`
 `toggleTask`
 `deleteTask`

foram envolvidas com `useCallback`.

Isso melhora o desempenho e evita renderizações desnecessárias.

4. Atualização Otimista de Estado
Antes, após qualquer alteração, era executado `fetchTasks()` para recarregar toda a lista.

 Ao criar uma tarefa, ela é adicionada diretamente ao estado.
Ao atualizar uma tarefa, ela é modificada localmente.
Ao deletar, ela é removida do array local.
Ao alterar o status, o item é atualizado diretamente.

Isso reduz requisições e torna a interface mais rápida.

 5. Separação de Responsabilidades
A comunicação com a API foi centralizada na função `

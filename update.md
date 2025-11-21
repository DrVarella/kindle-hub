Quero que você atue como desenvolvedor front-end (HTML, CSS e JavaScript puro) para ajustar e evoluir um aplicativo web que uso no Kindle.

Abaixo estão as mudanças e novas funcionalidades que quero implementar. Por favor, leia tudo com atenção e depois proponha um plano de modificação do código, traduzindo isso em HTML/CSS/JS organizado, bem comentado e fácil de manter.

Quero que você:

1. entenda o que cada item significa em termos de interface e lógica;
2. proponha a melhor forma de implementar;
3. escreva ou refatore o código necessário.

As tarefas são estas:

**2) Criar um menu para anotações integrado com o Notion.**
Adicione uma área ou menu específico de anotações pessoais dentro do app. A ideia é que, ao acessar esse menu, eu consiga abrir ou enviar anotações para páginas do Notion. Se possível, preveja integração via API do Notion ou, pelo menos, links estruturados que me levem para uma página específica no Notion correspondente às anotações (por exemplo, anotações do exame, da meditação, etc.). Estruture o código de forma que depois seja fácil plugar uma chamada real à API do Notion.

**3) Integração com pontos de Caminho, Sulco e Forja com pop-up horário.**
Quero um sistema de pop-ups de pontos de leitura de “Caminho”, “Sulco” e “Forja”. A cada hora, o app deve mostrar um ponto para rezar/meditar, seguindo uma ordem específica (por exemplo, percorrer sequencialmente uma lista de pontos e, quando acabar, recomeçar). Implemente uma lógica em JavaScript que:
– mantenha um índice ou estado de qual foi o último ponto mostrado;
– a cada intervalo de 1 hora, dispare um pop-up simples com o texto do ponto;
– siga a ordem definida (você pode simular ou deixar a estrutura pronta para uma lista de pontos).
Tenha em mente o ambiente do Kindle: o pop-up deve ser simples, legível e discreto, sem animações pesadas. Use a mesma estrutura da notificação de finalização do timer.
- faça isso somente entre as 7h e as 22h.

**4) Adicionar ao final do exame uma foto "download.jpeg"**
Na página do exame de consciência, ao final do conteúdo do exame, adicione a imagem em /home/pedro/kindle_hub/public/Imagens/download.jpeg. Ajuste o layout para que a imagem apareça centralizada, com tamanho adequado para leitura no Kindle, sem quebrar o fluxo da página. Se necessário, crie uma classe CSS específica para esse tipo de imagem devocional.

**5) Reduzir a margem superior do início do Exame.**
Na mesma página do exame de consciência, reduza o espaço em branco (margem superior) logo no início da página, para que o conteúdo comece um pouco mais “para cima” na tela, aproveitando melhor o espaço útil. Faça isso via CSS, de forma que não afete negativamente outras páginas.

**7) Remover o botão de reset diário e semanal.**
Atualmente existe um botão de “reset diário” e “reset semanal” que já não faz tanto sentido. Remova esses botões da interface e limpe o código correspondente (listeners, funções JS, etc.) para que nada fique sobrando ou quebrado.

**8) Integração da Ladainha também no Santo Rosário.**
Na seção do Santo Rosário, inclua a possibilidade de rezar também a Ladainha (por exemplo, a Ladainha de Nossa Senhora). Pode ser ao final do Rosário, com um botão do tipo “Rezar Ladainha” que expanda o texto da ladainha dentro da mesma página, mantendo o mesmo estilo visual do restante do Rosário.

**9) Jaculatórias nos mistérios do rosário.**
Dentro dos mistérios do Rosário, inclua jaculatórias (pequenas orações) associadas a cada mistério. A ideia é que, ao visualizar um mistério, apareça também uma ou mais jaculatórias relacionadas. Estruture isso no código como dados associando cada mistério a um conjunto de jaculatórias, de forma que seja fácil adicionar, remover ou trocar depois.

**10) Aumentar a foto da ação de graças e talvez usar um efeito tipo sanfona.**
Na parte da ação de graças, aumente o tamanho da imagem principal (mantendo boa legibilidade no Kindle). Avalie também implementar um efeito tipo “sanfona” (accordion) para deixar o conteúdo mais compacto: seções da ação de graças que podem ser expandidas/contraídas com um clique, deixando a página menos longa visualmente.

**11) Integração com calendário litúrgico.**
Adicione uma integração com o calendário litúrgico, para saber a missa do dia e outras informações relacionadas (por exemplo, pelo diretório que o Rodrigo faz). Estruture o código de forma que possamos plugar uma API ou um arquivo de dados com as informações litúrgicas. Na interface, crie uma área ou widget em que apareçam: o dia litúrgico, a festa ou memória, e, se possível, um resumo da missa do dia.

**12) Página de intercâmbio rápido entre preces, Salmo 2 e outras orações.**
Crie uma página dedicada para alternar rapidamente entre algumas orações específicas (preces, Salmo 2 e outras orações escolhidas). Essa página deve permitir trocar de texto de forma prática, por exemplo com abas ou botões que mudam o conteúdo principal. Se for viável, tente estruturar o código pensando em usar a API de um site de textos litúrgicos/orações para carregar esses textos, mesmo que, por agora, seja só uma função simulando essa chamada.

**13) Atalho para o “Trium Perorum” na ação de graças.**
Na seção de ação de graças, adicione um atalho visível para a oração “Trium Perorum” (pode ser um botão ou link). Ao clicar, o usuário deve ir diretamente para o texto dessa oração dentro da própria página ou abrir um pequeno painel com o texto.

**14) Widget da previsão do tempo variando de tamanho com a barra de agenda.**
O widget de previsão do tempo deve ajustar seu tamanho (altura principalmente) conforme a barra de agenda é aberta ou fechada. Se a barra de agenda estiver mais expandida, o widget pode reduzir um pouco a altura; se a agenda estiver recolhida, o widget pode usar mais espaço. Implemente essa relação com JavaScript, ouvindo o evento de abertura/fechamento da barra de agenda e aplicando classes CSS ou estilos inline no widget de clima.

**15) Toggle para alternar entre relógio e timer.**
Atualmente há um relógio e um timer. Quero que seja possível alternar entre eles clicando diretamente no relógio ou no timer (um toggle por clique). Se o relógio estiver visível e eu clicar, mostra o timer; se o timer estiver visível e eu clicar, volta para o relógio. Implemente essa lógica de forma bem simples e estável, cuidando para que o estado (o que está ativo) fique claro na interface.

**16) Salvar onde parei na leitura da Bíblia.**
Na página da Bíblia, quero que o app memorize onde parei na leitura (por exemplo, livro, capítulo e, se possível, versículo aproximado). Use armazenamento local (localStorage ou equivalente que funcione bem no ambiente do Kindle) para salvar esse “último ponto de leitura” e, ao voltar para a Bíblia, retomar automaticamente dali ou oferecer um botão “Retomar de onde parei”.

**17) Adicionar um contador também na página da Bíblia.**
Além de salvar o ponto de leitura, quero um contador relacionado à leitura da Bíblia (por exemplo, tempo de leitura ou número de capítulos lidos na sessão). Pode ser um pequeno contador exibindo quanto tempo estou lendo desde que abri a página da Bíblia, ou quantos capítulos avancei. Escolha uma implementação simples e bem visualmente integrada com o restante do app.

**18) Jaculatórias espalhadas pelo app.**
Espalhe jaculatórias por outras partes do app também, não apenas no Rosário. Por exemplo, no exame, na ação de graças, na página inicial, etc. A ideia é que, ao navegar, o usuário encontre pequenas orações curtas em lugares estratégicos. Estruture o código de modo que essas jaculatórias fiquem em um objeto ou array central, facilitando a edição.

**19) Lista de mortificação diária.**
Crie uma lista específica de mortificações diárias. Pode ser uma seção simples em que haja itens (checklist) para marcar o que foi feito naquele dia. Pense em algo leve: uma lista de itens com caixas de seleção e, se for simples de implementar, que resete de forma adequada (por exemplo, diariamente), mas sem o antigo botão de reset diário/semanal.

**20) Lembretes específicos de cada dia (0 a 6).**
Implemente uma lógica que permita ter lembretes específicos para cada dia da semana (por exemplo, índice 0 a 6). Esses lembretes podem ser mostrados na agenda, na página inicial ou em um pequeno painel. Estruture os dados como um mapeamento dia-da-semana → lista de lembretes, e faça com que, ao carregar o app, sejam exibidos os lembretes correspondentes ao dia atual.

**21) API com o WhatsApp.**
Prepare uma integração básica com o WhatsApp: por exemplo, um botão que abra uma conversa no WhatsApp com uma mensagem pré-preenchida (usando links oficiais do WhatsApp) ou, se for possível no ambiente do app, alguma forma de compartilhar trechos (como uma jaculatória ou um ponto de livro) pelo WhatsApp. Estruture o código para que depois possamos evoluir isso para algo mais sofisticado.

**22) Resolver problema da agenda.**
Há um problema/bug atual na agenda. Organize o código da agenda (HTML/CSS/JS) de forma mais clara e, se possível, corrija os comportamentos inconsistentes (como atualização, navegação entre dias/semanas, ou exibição dos eventos). Deixe a lógica de eventos bem estruturada, com funções específicas para carregar eventos, renderizar e atualizar a interface, facilitando o debug.

**23) Contador de eventos mostrando eventos prestes a começar e a terminar.**
No contador de eventos, ajuste a lógica para que ele mostre, além dos eventos em andamento ou terminando, também os eventos que vão começar em até 5 minutos. Quero um comportamento do tipo: se um evento está prestes a começar (faltando 5 minutos) ele já aparece em destaque, junto com os que estão terminando ou em curso. Estruture bem os filtros de tempo (por exemplo, comparando o horário atual com o início e o fim do evento) para que isso fique confiável.

Por favor, responda primeiro recapitulando rapidamente como você entendeu o contexto do app e depois proponha a arquitetura/organização das mudanças (arquivos, módulos JS, componentes HTML/CSS). Em seguida, comece a sugerir e escrever o código necessário para implementar essas funcionalidades, passo a passo.

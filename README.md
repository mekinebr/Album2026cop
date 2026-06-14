# Álbum Copa 2026 - pacote final GitHub + APK

## O que foi corrigido

- Busca exata:
  - `BRA 1` abre somente BRA 1.
  - `BRA 11` abre somente BRA 11.
  - `FWC 00` abre somente FWC 00.
  - `CC 2` abre somente CC 2.
- Resultado da busca aparece logo abaixo do campo de pesquisa.
- Depois de marcar uma figurinha pesquisada, a busca limpa automaticamente.
- Projeto preparado para gerar APK pelo GitHub Actions.

## Como subir no GitHub

1. Extraia este ZIP no seu computador.
2. Abra o repositório do GitHub do álbum.
3. Envie/substitua todos os arquivos do projeto por estes arquivos.
4. Faça commit na branch `main`.

## Como publicar no Vercel

1. Se o GitHub já está conectado na Vercel, aguarde o deploy automático.
2. Depois abra:
   https://album2026cop.vercel.app

## Como gerar o APK instalável

1. No GitHub, abra seu repositório.
2. Clique na aba **Actions**.
3. Clique em **Build APK Android**.
4. Clique em **Run workflow**.
5. Aguarde terminar.
6. No final da página do workflow, abra **Artifacts**.
7. Baixe:
   `album-copa2026-apk-instalavel`
8. Extraia o ZIP baixado.
9. Instale o arquivo:
   `app-debug.apk`

## Se o Android avisar fonte desconhecida

Toque em:
- Configurações
- Permitir instalação desta fonte
- Instalar

Esse APK debug é para instalação direta/teste. Para Play Store, precisa gerar versão release assinada.

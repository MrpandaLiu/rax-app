import { IFormattedLoaderQuery } from '../types';
import addPageHTMLAssign from './addPageHTMLAssign';

export default function addBuiltInRenderComponentToHTML({ updateDataInClient }: IFormattedLoaderQuery) {
  return `
  async function renderComponentToHTML(Component, ctx, initialData, htmlTemplate) {
    const $ = new Generator(htmlTemplate || '__RAX_APP_SERVER_HTML_TEMPLATE__');

    const pageInitialProps = await getInitialProps(Component, ctx);
    const data = {
      __SSR_ENABLED__: true,
      initialData,
      pageInitialProps
    };
    // Assign pageHTML
    ${addPageHTMLAssign()}
    $.root.innerHTML = pageHTML;
    ${updateDataInClient ? '' : '$.insertScript(\'<script data-from="server">window.__INITIAL_DATA__=\' + stripXSS(JSON.stringify(data)) + \'</script>\');'}
    return $.html();
  };
  `;
}

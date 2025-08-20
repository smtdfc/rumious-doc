import { Component, createRef, watch, unwatch } from '@rumious/core';
import { RouteProps, RouteComponent } from '@rumious/router';
import { ContentService } from '@services/content';
import MarkdownIt from 'markdown-it';

const md: MarkdownIt = new MarkdownIt({
  highlight: function (str: string, lang: string) {
    if (lang) {
      return `<pre class="language-${lang}"><code class="language-${lang}">${md.utils.escapeHtml(str)}</code></pre>`;
    }
    return `<pre class="language-none"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

export default class Page extends Component<RouteProps> {
  static tagName = 'doc-page';
  private pageRef = createRef<HTMLDivElement>();

  async renderPageContent(pageName: string) {
    let content = await ContentService.getPageContent(pageName);
    const result = md.render(content);
    this.pageRef.html = result;
    hljs.highlightAll();
  }

  onParamsChange() {
    let {
      routeData: { params },
    } = this.props;
    let pageName = params.getKey('name');
    if (pageName) this.renderPageContent(pageName);
  }

  onRender() {
    let {
      routeData: { params },
    } = this.props;
    watch(params, this.onParamsChange.bind(this));
    this.onParamsChange();
  }

  onDestroy() {
    let {
      routeData: { params },
    } = this.props;
    unwatch(params, this.onParamsChange.bind(this));
  }

  template() {
    return <article class="markdown-body" ref={this.pageRef}></article>;
  }
}

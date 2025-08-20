import { Component } from '@rumious/core';

export default class Footer extends Component<{}> {
  static tagName = 'page-footer';

  template() {
    return (
      <footer class="footer">
        <div class="footer-container">
          <p>
            Rumious v3 — by <strong>smtdfc team</strong>. <br />
            Made with ❤️ and zero sleep
          </p>
          <br />
          <p>
            <a href="https://github.com/smtdfc/rumious" target="_blank">GitHub</a>|
            <a href="#/documentation/introduction">Docs</a> |
            <a href="#/playground">Playground</a> |
          </p>
        </div>
      </footer>
    );
  }
}

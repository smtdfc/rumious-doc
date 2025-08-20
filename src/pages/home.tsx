import { Component } from '@rumious/core';
import { RouteProps, RouteComponent } from '@rumious/router';
import styles from '@styles/pages/home.module.css';
import Logo from '@assets/logo.webp';

export default class Page extends Component<RouteProps> {
  static tagName = 'home-page';

  onRender() {
    hljs.highlightAll();
  }

  template() {
    return (
      <div class={styles.page}>
        <section class={styles.topSection}>
          <img
            alt="hero-img"
            src={Logo}
            width="200"
            height="200"
            fetchpriority="high"
            decoding="async"
          />
          <p class="p-2" style="max-width:80%">
            A Frontend framework based on Web Components, enabling you to build
            modern interfaces without relying on Virtual DOM{' '}
          </p>
          <div class={styles.btnGroup}>
            <button style="width:200px" class={styles.cab}>
              Getting started{' '}
            </button>
          </div>
        </section>
        <section class={styles.featureSection}>
          <h2>Features</h2>
          <div class={styles.featureCardGroup}>
            <div class={styles.featureCard}>
              <i class="material-symbols-outlined">rocket_launch</i>
              <span>
                <h3>Web Components</h3>
                <p>
                  Fully compatible with any framework or works independently.
                </p>
              </span>
            </div>
            <div class={styles.featureCard}>
              <i class="material-symbols-outlined">speed</i>
              <span>
                <h3>No Virtual DOM</h3>
                <p>High performance with minimal resource usage.</p>
              </span>
            </div>
            <div class={styles.featureCard}>
              <i class="material-symbols-outlined">sync</i>
              <span>
                <h3>Lifecycle Hooks Support</h3>
                <p>Control the rendering and removal process of components.</p>
              </span>
            </div>
          </div>
        </section>
        <section class={styles.quickStartSection}>
          <h2>Quick Start</h2>

          <h3>Installation</h3>
          <pre class={styles.code}>
            <code class="language-bash">{`npm install @rumious/core @rumious/browser @rumious/cli`}</code>
          </pre>

          <h3>Create a New Project</h3>
          <pre class={styles.code}>
            <code class="language-bash">{`rumious init`}</code>
          </pre>

          <h3>Create Your First App</h3>
          <p>Navigate to the src/index.tsx file and add the following code:</p>
          <pre class={styles.code}>
            <code class="language-tsx">{`import {
  Fragment,
  createApp
} from '@rumious/core';

const app = createApp({
  root: document.body
});

app.setRootLayout(
  <Fragment>
    <h1>Hello Rumious</h1>
  </Fragment>
);


app.start();
`}</code>
          </pre>

          <h3>Build and Test Your Project</h3>
          <p>
            Once you've created your app, you can build it and start testing it
            locally.
          </p>
          <p>To build your project, run:</p>
          <pre class={styles.code}>
            <code class="language-bash">{`rumious dev
npx http-server ./public -p 3000
`}</code>
          </pre>

          <p>
            After the build is complete, open your browser and go to
            http://localhost:3000 to see the result of your app.
          </p>
        </section>
        <section class={styles.contributeSection}>
          <h2>Contributing</h2>
          <p>
            Contributions are warmly welcome! Feel free to open issues or submit
            pull requests at:{' '}
            <a class="link" href="https://github.com/smtdfc/rumious">
              Rumious Repository
            </a>
            Please follow the Contributor Covenant Code of Conduct to keep the
            community positive and respectful.
          </p>
        </section>
      </div>
    );
  }
}

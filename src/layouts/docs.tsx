import { Component, For, Context, createRef } from '@rumious/core';
import { RouteProps, RouteComponent } from '@rumious/router';
import { ContentService } from '@services/content';
import AppContext from '../context';
import styles from '@styles/layouts/doc.module.css';
import { PageMap } from '../types';

function renderMenu(controller, node: PageMap, index: Record<string, any>) {
  let keys = Object.keys(node).filter((v) => v != '$title');
  return (
    <ul>
      <For
        list={keys}
        template={(value: string) => {
          console.log(value);
          if (node[value] && Object.keys(node[value]).length > 0)
            return (
              <li>
                <a class="link">{index[value]['$title']}</a>
                {renderMenu(controller, node[value], index[value])}
              </li>
            );
          return (
            <li>
              <a
                on:click={() => controller.emit('close')}
                href={`#/documentation/${value}`}
              >
                {index[value]['$title']}
              </a>
            </li>
          );
        }}
      />
    </ul>
  );
}

class Menu extends Component<{ controller: Context<object> }> {
  private menuRef = createRef<HTMLDivElement>();

  onRender() {
    let { controller } = this.props;
    let overlay = document.querySelector('#mainOverlay')!;
    controller.on('open', () => {
      this.menuRef.addClass(styles.active);
      overlay.classList.add('active');
    });

    controller.on('close', () => {
      this.menuRef.removeClass(styles.active);
      overlay.classList.remove('active');
    });
  }

  closeMenu() {
    let { controller } = this.props;
    controller.emit('close', {});
  }

  async template() {
    let { controller } = this.props;
    let pageIndex = AppContext.getKey('pageIndex');
    if (Object.keys(pageIndex).length == 0)
      pageIndex = await ContentService.getListPage();
    return (
      <div class={styles.menu} ref={this.menuRef}>
        <button
          class={styles.menuBtn + ' material-symbols-outlined'}
          on:click={() => this.closeMenu()}
        >
          close
        </button>
        {renderMenu(controller, AppContext.getKey('pageMap'), pageIndex)}
      </div>
    );
  }
}

export default class Layout extends Component<RouteProps> {
  static tagName = 'doc-layout';
  private menuControl = new Context({});
  template() {
    let { routeSlot } = this.props;

    return (
      <div class={styles.layout}>
        <Menu controller={this.menuControl} />
        <button
          class={styles.openMenuBtn}
          on:click={() => this.menuControl.emit('open', {})}
        >
          <i class="material-symbols-outlined">menu</i>Menu
        </button>
        <span>{routeSlot}</span>
      </div>
    );
  }
}

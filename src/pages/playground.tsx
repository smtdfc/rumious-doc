import { Component, createRef } from '@rumious/core';
import { RouteProps, RouteComponent } from '@rumious/router';
import {debounce} from '../utils';
import styles from '@styles/pages/playground.module.css';


let Compiler: any = null;
export default class Page extends Component < {} > {
  private overlayRef = createRef < HTMLDivElement > ();
  private outputRef = createRef < HTMLTextAreaElement > ();
  
  onInput(e: Event) {
    try {
      let value = e.target.value;
      let compiler = new Compiler({
        "environment": "@rumious/browser"
      });
      
      let { code, map } = compiler.compile(value, {
        type: "module",
        filename: "index.tsx"
      });
      
      this.outputRef.value = code;
      this.outputRef.removeClass(styles.errorOutput);
      
      this.outputRef.value = code;
    } catch (e: any) {
      let msg = (e as Error).message;
      this.outputRef.value = msg;
      this.outputRef.addClass(styles.errorOutput);
    }
  }
  
  onRender() {
    import("/playground/compiler.js")
      .then((t) => {
        Compiler = t.Compiler;
        this.overlayRef.setStyle("display", "none");
      });
  }
  
  template() {
    return (
      <div class={styles.page}>
        <div class={styles.loadOverlay} ref={this.overlayRef}></div>
        <h1>Rumious Playground</h1>
        <div class={styles.codeEditContainer}>
          <span>
            <label>Input Code</label><br/>
            <textarea on:input={debounce((e)=>this.onInput(e))} />
          </span>
          <span>
            <label>Output Code</label><br/>
            <textarea ref={this.outputRef} class={styles.codeOutput} readonly/>
          </span>
        </div>
      </div>
    );
  }
}
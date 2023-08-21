<script lang="ts">
  // node modules
  import { EditorState, EditorView, basicSetup } from '@codemirror/basic-setup';
  import { RangeSetBuilder, StateField, Range } from '@codemirror/state';
  import { Decoration, type DecorationSet } from '@codemirror/view';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { sql, MySQL } from '@codemirror/lang-sql';
  import { json } from '@codemirror/lang-json';

  // svelte
  import { onMount } from 'svelte';

  // components
  import ErrorMessage from './ErrorMessage.svelte';

  export let label = '';
  export let name = '';
  export let value = '';
  export let type = '';
  // export let disabled = false;
  // Message to display, when an Error occurs. Doesn't show anything if the string is empty.
  export let errormsg = '';
  // Hide the error message, even if `errormsg` is set.
  export let showerror = true;

  let class_ = '';
  export { class_ as class };

  let state: EditorState;
  let view: EditorView;
  let parent: HTMLElement;

  let liveValue = value;

  const mustacheRegExp = /\{\{.+?\}\}/g;

  const mustacheField = StateField.define<DecorationSet>({
    create(state) {
      const builder = new RangeSetBuilder<Decoration>();

      for (const match of state.doc.toString().matchAll(mustacheRegExp)) {
        builder.add(match.index, match.index + match[0].length, mustacheMark);
      }

      return builder.finish();
    },
    update(mustaches, tr) {
      mustaches = mustaches.map(tr.changes);

      const doc = tr.newDoc.toString();

      const add: Range<Decoration>[] = [];
      const obsoleteStarts: number[] = [];

      tr.changes.iterChanges((_fromA, toA, _fromB, toB) => {
        let start = -1;
        let lastChar = '';

        for (let i = toA - 1; i >= 0; i--) {
          const char = doc[i];

          if (lastChar === '{' && char === '{') {
            start = i;
          }
          if (lastChar === '}' && char === '}') {
            break;
          }

          lastChar = char;
        }

        lastChar = doc[toA - 1];

        for (let i = toA; i < toB; i++) {
          const char = doc[i];

          if (lastChar === '{' && char === '{' && start === -1) {
            start = i - 1;
          }
          if (lastChar === '}' && char === '}' && start >= 0) {
            add.push(mustacheMark.range(start, i + 1));
            start = -1;
          }

          lastChar = char;
        }

        for (let i = toB; i < doc.length; i++) {
          const char = doc[i];

          if (lastChar === '{' && char === '{' && start >= 0) {
            obsoleteStarts.push(i - 1);
          }
          if (lastChar === '{' && char === '{' && start === -1) {
            start = i - 1;
          }
          if (lastChar === '}' && char === '}' && start >= 0) {
            add.push(mustacheMark.range(start, i + 1));
            break;
          }

          lastChar = char;
        }
      });

      mustaches = mustaches.update({
        filter(from, to) {
          return (
            !obsoleteStarts.includes(from) &&
            (tr.changes.touchesRange(from, to) !== true ||
              doc.slice(from, to).match(mustacheRegExp)?.length === from - to)
          );
        },
        add,
      });

      return mustaches;
    },
    provide: (f) => EditorView.decorations.from(f),
  });

  const mustacheMark = Decoration.mark({ class: 'cm-mustache' });

  const mustacheTheme = EditorView.baseTheme({
    '.cm-mustache': { backgroundColor: '#ffec513d' },
  });

  onMount(() => {
    state = EditorState.create({
      doc: liveValue,
      extensions: [
        basicSetup,
        {
          json: json(),
          sql: sql({
            dialect: MySQL,
          }),
        }[type] ?? [],
        oneDark,
        mustacheField,
        mustacheTheme,
      ],
    });

    view = new EditorView({
      state: state,
      parent,
      dispatch: (tr) => {
        view.update([tr]);
        liveValue = tr.state.doc.toString();
      },
    });

    const cm = parent.querySelector('.cm-editor .cm-scroller') as HTMLElement;
    const line = parent.querySelector('.cm-line') as HTMLElement;
    cm.style.minHeight = `${line.clientHeight * 3 + 8}px`;
    cm.style.maxHeight = `${line.clientHeight * 8 + 8}px`;

    return () => {
      view.destroy();
    };
  });

  $: if (view) {
    updateValue(value);
  }

  function updateValue(val: string) {
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: val,
      },
    });
  }
</script>

<div class={class_}>
  <label class="block text-sm text-secondary disabled:text-secondary-lighter" bind:this={parent}>
    {label}
    <textarea hidden {name} value={liveValue} tabindex="-1" aria-hidden="true" />
  </label>
  <ErrorMessage {name} msg={errormsg} show={showerror} />
</div>

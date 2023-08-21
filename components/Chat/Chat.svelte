<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';
  import { useMutation, useQuery, useQueryClient } from '@sveltestack/svelte-query';

  // svelte
  import { getContext, onDestroy, onMount } from 'svelte';
  import { browser } from '$app/env';
  import type { Readable } from 'svelte/store';

  // lib
  import type { APIError } from '$baselib/api';
  import type { APIFile } from '$baselib/api/file';
  import type { APITopicItem, TopicRequest } from '$baselib/api/topic';
  import { serverURL } from '$baselib/config';
  import { APIResponseError } from '$baselib/connection';
  import { dateFormat, dateFromAPIDate, dateToAPIDate, timeFormat } from '$baselib/formater';
  import { state, userHasRight } from '$baselib/stores';
  import { toArray } from '$baselib/util';

  // components
  import Button from '$components/Form/Button.svelte';
  import FileUpload from '$components/Form/FileUpload.svelte';
  import Loading from '$components/Loading.svelte';
  import Message from '$components/Chat/Message.svelte';
  import ModalAlert from '$components/Modal/ModalAlert.svelte';
  import Nodata from '$components/Nodata.svelte';
  import Textarea from '$components/Form/Textarea.svelte';
  import type { ModalContext } from '$components/Modal/ModalProvider.svelte';

  // icons
  import AttachIcon from '$icons/attach.svg?component';
  import PaperplaneIcon from '$icons/paperplane.svg?component';

  const { open, close } = getContext<ModalContext>('simple-modal');

  export let user_ID: string;
  export let topic_ID: string = '';
  let class_ = '';
  export { class_ as class };

  let messageContainer: HTMLElement;

  const queryClient = useQueryClient();

  const topicRequest = getContext<Readable<TopicRequest>>('topicRequest');

  $: topicItemKey = [
    `topicitem/get`,
    {
      topic_ID,
    },
  ];

  $: if (topic_ID) {
    shouldScrollIntoView = true;
  }

  $: topicItemResult = useQuery<APITopicItem[], APIError>(topicItemKey, {
    enabled: browser && $userHasRight('topicitem', 'get') && Boolean(topic_ID),
    select: toArray,
    onSuccess: () => {
      if (shouldScrollIntoView) {
        scrollIntoView();
        requestAnimationFrame(scrollIntoView);
      }
    },
  });

  const topicMemberMutation = useMutation(() =>
    $topicRequest.setTopicMember({
      topic_ID,
      topic_member_function: '2',
    }),
  );

  const topicItemMutation = useMutation(
    () =>
      $topicRequest.setTopicItem({
        topic_ID,
        topic_item_content: topicItemTextArea,
        topic_item_attachment: saveMessageAttachmentFiles(),
      }),
    {
      onMutate: async () => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(topicItemKey);

        // Snapshot the previous value
        const previousTopics = queryClient.getQueryData<APITopicItem[]>(topicItemKey);

        // Optimistically update to the new value
        queryClient.setQueryData<APITopicItem[]>(topicItemKey, (old) => [
          ...toArray(old),
          {
            me: '1',
            topic_item_ID: '',
            topic_item_content: topicItemTextArea,
            user_ID: $state.user.user_ID,
            topic_item_created: dateToAPIDate(new Date()),
            user_personal_prename: $state.user.user_personal_prename,
            user_personal_lastname: $state.user.user_personal_lastname,
            topic_item_attachment: saveMessageAttachmentFiles(),
            file: [],
          } as APITopicItem,
        ]);

        scrollIntoView();

        // Return a context object with the snapshotted value
        return { previousTopics };
      },
      onError: (res, _data, context: { previousTopics: APITopicItem[] }) => {
        queryClient.setQueryData<APITopicItem[]>(topicItemKey, context.previousTopics);
        if (res instanceof APIResponseError && res.status === 403) {
          open(
            ModalAlert,
            {
              successBtnText: $_('chat.alert.success_button'),
              text: $_('chat.alert.text'),
              title: $_('chat.alert.title'),
              onAccept: async () => {
                await $topicMemberMutation.mutateAsync();
                await $topicItemMutation.mutateAsync();
                close();
              },
              onCancel: () => {
                close();
              },
            },
            {},
          );
        } else {
          topicItemTextArea = '';
          messageAttachments = [];
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries(topicItemKey);
        topicItemTextArea = '';
        messageAttachments = [];
        scrollIntoView;
      },
    },
  );

  let topicItemTextArea: string;

  type TopicBlock = {
    creator_ID: string;
    topic: TopicMessage[];
    mine: string;
    owner_name: string;
    profile_picture: string;
  };

  type TopicDay = {
    blocks: TopicBlock[];
    time: Date;
  };

  type TopicMessage = {
    content: string;
    files: APIFile[];
    msg_time: Date;
    topic_item_ID: string;
  };

  function process_topic(topic: APITopicItem[]): TopicDay[] {
    const result: TopicDay[] = [];
    let day: TopicDay;
    let block: TopicBlock;

    for (const message of topic) {
      const time = dateFromAPIDate(message.topic_item_created);
      if (
        day === undefined ||
        time.getFullYear() !== day.time.getFullYear() ||
        time.getMonth() !== day.time.getMonth() ||
        time.getDay() !== day.time.getDay()
      ) {
        if (day !== undefined) {
          if (block !== undefined) day.blocks.push(block);
          block = undefined;
          result.push(day);
        }
        day = {
          blocks: [],
          time,
        };
      }
      if (block !== undefined) {
        if (block.mine === '') {
          if (message.me !== '1') {
            if (block.creator_ID !== message.user_ID) {
              day.blocks.push(block);
              block = {
                creator_ID: message.user_ID,
                topic: [],
                mine: message.me,
                owner_name: message.user_personal_prename + ' ' + message.user_personal_lastname,
                profile_picture: message.user_personal_image,
              };
            }
          }
        }
      }
      if (block === undefined || block.mine !== message.me) {
        if (block !== undefined) day.blocks.push(block);

        block = {
          creator_ID: message.user_ID,
          topic: [],
          mine: message.me,
          owner_name: message.user_personal_prename + ' ' + message.user_personal_lastname,
          profile_picture: message.user_personal_image,
        };
      }
      block.topic.push({
        content: message.topic_item_content,
        files: message.file,
        msg_time: time,
        topic_item_ID: message.topic_item_ID,
      });
    }

    if (block !== undefined) day.blocks.push(block);
    if (day !== undefined) result.push(day);

    return result;
  }

  let messageAttachments: string[] = [];

  function saveMessageAttachmentFiles() {
    return JSON.stringify(messageAttachments);
  }

  let shouldScrollIntoView = true;

  function scrollIntoView() {
    if (messageContainer) messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  let source: EventSource;
  let hash: string;

  onMount(() => {
    source = new EventSource(serverURL + 'topicitem/status/' + topic_ID + '?session=' + $state.session);

    console.log('open event source');

    source.addEventListener(
      'message',
      async function (e) {
        var obj = JSON.parse(e.data);

        if (hash == '') {
          hash = obj.success.data;
        } else if (hash !== obj.success.data) {
          hash = obj.success.data;

          queryClient.invalidateQueries(topicItemKey);
          shouldScrollIntoView = true;
        }
      },
      false,
    );

    scrollIntoView();
  });

  onDestroy(() => {
    source.close();

    console.log('close event source');
  });
</script>

<div class={['flex flex-col justify-between overflow-hidden', class_].join(' ')}>
  <div bind:this={messageContainer} class="grow overflow-y-auto overflow-x-hidden space-y-4 md:mb-0 lg:pb-4 pb-16">
    {#if !$userHasRight('topicitem', 'get')}
      <Nodata>
        <svelte:fragment slot="title">{$_('error.insufficient_rights_title')}</svelte:fragment>
        <svelte:fragment slot="text">{$_('error.insufficient_rights_text')}</svelte:fragment>
      </Nodata>
    {:else if !topic_ID}
      <Nodata>
        <svelte:fragment slot="title">{$_('chat.notselected.title')}</svelte:fragment>
        <svelte:fragment slot="text">{$_('chat.notselected.text')}</svelte:fragment>
      </Nodata>
    {:else if $topicItemResult.isLoading || $topicItemResult.isIdle}
      <div class="w-full h-full flex justify-center items-center ">
        <Loading center />
      </div>
    {:else if $topicItemResult.isSuccess && $topicItemResult.data.length === 0}
      <Nodata>
        <svelte:fragment slot="title">{$_('chat.nodata.title')}</svelte:fragment>
        <svelte:fragment slot="text">{$_('chat.nodata.text')}</svelte:fragment>
      </Nodata>
    {:else if $topicItemResult.isSuccess}
      {#each process_topic($topicItemResult.data) as topicDay}
        <div class="space-y-4 mx-auto text-center text-xs">{$dateFormat.format(topicDay.time)}</div>
        {#each topicDay.blocks as topicBlock}
          <div class="space-y-2">
            {#each topicBlock.topic as topicMessage, msg}
              <Message
                received={user_ID !== topicBlock.creator_ID}
                attachments={topicMessage.files}
                hideMessage={!topicMessage.content}
                picture={msg === topicBlock.topic.length - 1}
                owner_name={topicBlock.owner_name}
                id={topicBlock.profile_picture}
              >
                <svelte:fragment slot="time">{$timeFormat.format(topicMessage.msg_time)}</svelte:fragment>
                <svelte:fragment slot="value">{topicMessage.content}</svelte:fragment>
              </Message>
            {/each}
          </div>
        {/each}
      {/each}
    {:else}
      {$_('error.generic')}
    {/if}
  </div>

  {#if $userHasRight('topicmessage', 'set')}
    <div class="c-chat-box">
      <div class="justify-center">
        <FileUpload
          bind:files={messageAttachments}
          fileType="project_images"
          placeholder={$_('project.form.project_default_title')}
          class="mt-0 border-white bg-white border-solid float-left mr-4 overflow-auto h-fit absolute w-[28rem] mx-auto min-h-[6.7rem] max-h-[6.7rem] bottom-[2.8rem] grow"
          hideZone
          viewFiles={false}
          useChatStyling
          on:upload={(file) => {
            messageAttachments.push(file.detail);
          }}
          on:removedAll={() => {
            messageAttachments = [];
          }}
        >
          <div
            slot="button"
            class="flex flex-row items-center relative w-6 h-6 space-x-3 cursor-pointer text-white justify-center text-lg "
          >
            <AttachIcon />
            {#if messageAttachments.length > 0}
              <span
                class="absolute bg-primary w-[1rem] h-[1rem] rounded-lg bottom-[-2px] right-[-5px] text-white text-xs"
                ><span class="absolute bottom-[-6px] right-[5px]">{messageAttachments.length}</span></span
              >
            {/if}
          </div>
        </FileUpload>
      </div>

      <div class="flex-grow h-full">
        <Textarea
          textareaClass="bg-white w-full max-h-20 placeholder:align-middle"
          placeholder={$_('chat.message_placeholder')}
          minRows={1}
          maxRows={4}
          bind:value={topicItemTextArea}
          on:keypress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (topicItemTextArea !== '' || messageAttachments.length > 0) $topicItemMutation.mutate();
            }
          }}
        />
      </div>

      <Button
        class="text-white w-6 h-6 text-lg p-0"
        submit
        color="blank"
        on:click={() => {
          if (topicItemTextArea !== '' || messageAttachments.length > 0) $topicItemMutation.mutate();
        }}><PaperplaneIcon width="22" /></Button
      >
    </div>
  {/if}
</div>

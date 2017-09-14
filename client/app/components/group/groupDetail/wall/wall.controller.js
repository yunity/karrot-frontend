class WallController {

  constructor(GroupService, CurrentGroup, Conversation) {
    "ngInject";
    Object.assign(this, {
      groupData: CurrentGroup.value,
      Conversation,
      GroupService,
      conversation: null,
      newMessageBody: "",
      mdinputOptions: {
        showSubmit: true
      }
    });
  }

  sendMessage() {
    this.conversation.sendMessage({ content: this.newMessageBody });
    this.newMessageBody = "";
  }

  $onInit() {
    this.GroupService.conversation(this.groupData.id).then(({ id }) => {
      this.Conversation.subscribe(id).then((val) => {
        this.conversation = val;
        console.log(this.groupHistory.results);
        console.log(this.conversation);
      });
    });
  }

  $onDestroy() {
    if (this.conversation) this.conversation.unsubscribe();
  }

}

export default WallController;

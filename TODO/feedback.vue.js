// register modal component
Vue.component("modal", {
  template: "#modal-template"
});

var app = new Vue({
  el: "#app",

  //------- data --------
  data: {
    serviceURL: "https://info3103.cs.unb.ca:8099",
    input: {
      username: "",
      password: ""
    },
    loggedIn: false,
    userId: 0,
    userName: "",
    userFullName: "",
    projects: [],
    selectedProject: {},
    editModal: false,
    feedbacks: []
  },
   //-------End data --------

   //-------Lifecycle -------
   mounted: function(){
    $( ".jq-accordian" ).accordion( "refresh" );
   },
   /*function() {
    axios
    .get(this.serviceURL+"/signin")
    .then(response => {
      if (response.data.status == "success") {
        this.loggedIn = true;
        this.userId = response.data.userinfo.userId;
        this.userFullName = response.data.userinfo.userFullName;
       }
    })
    .catch(error => {
      this.loggedIn = false;
      console.log(error);
      return;
    });
    this.getProjects();
    $( ".jq-accordion" ).accordion( "option", "active", false );
  },*/
   //-------Computed --------
  computed: {
    dateSortedFeedback: function() {
      if(this.feedbacks.length > 0){
        function compare(a, b) {
          if (a.feedbackSince > b.feedbackSince)
            return -1;
          if (a.feedbackSince < b.feedbackSince)
            return 1;
          return 0;
        }
      }
      return this.feedbacks.sort(compare);
    }
  },
   methods: {
     async login() {
      if (this.input.username == "" || this.input.password == "") {
        alert("A username and password must be present");
      } else {
        await axios
        .post(this.serviceURL+"/signin", {
          "userName": this.input.username,
          "password": this.input.password
        })
        .then(response => {
          if (response.data.status == "success") {
            this.loggedIn = true;
            this.userId = response.data.userinfo.userId;
            this.userName = this.input.username;
            this.userFullName = response.data.userinfo.userFullName;

            this.getProjects();
            $( ".jq-accordion" ).accordion( "option", "active", false );        
          }
        })
        .catch(e => {
          alert("The username or password was incorrect, try again");
          this.input.password = "";
          console.log(e);
          return;
        });
      }
    },

    logout() {

      axios
      .delete(this.serviceURL+"/signin")
      .then(response => {
          location.reload();
      })
      .catch(e => {
        console.log(e);
      });     
      $( ".jq-accordion" ).accordion( "option", "active", false );
      this.loggedIn = false;

    },

    async getProjects(){
      // Get videos. Need to be able to take the video and assign it to a project.
      await axios
      .get(this.serviceURL+"/videos")
      .then(response => {
        videos = response.data;
        // Delete current projects
        //this.projects = [];
        // Create new project objects, insert the video data
        for(i=0;i<videos.length;i++){
          project = {};
          project.members = [];
          project.users = [];
          project.video = videos[i];
          project.projectName = videos[i].projectName;
          project.projectId = videos[i].videoId;
          project.feedback = "";
          project.like = false;  
          project.commentable = true;
          this.projects.push(project);
        }
        this.getMembers();
      })
      .catch(e => {
        alert("Unable to load the video data");
        console.log(e);
        return;
      });
    },
    async getMembers(){
      // For each project, get the members and insert into the json object
      for(i=0;i<this.projects.length;i++) {
        project = this.projects[i];
        let url = this.serviceURL+"/videos/"+project.video.videoId+"/members";
      
        await axios
        .get(url)
        .then(response => {
          // Add project members
         for(j=0;j<response.data.length;j++){
            this.projects[i].members.push(response.data[j].member);
            this.projects[i].users.push(response.data[j].user);
         // You own this? Read-only for you!
         if(this.userName == response.data[j].user) {
              this.projects[i].commentable = false;
            }
          }
         })
        .catch(e => {
          alert("Unable to load the member data");
          console.log(e);
        });
      }
    },

    async getFeedbacks(videoId){
      // Get all comments for a given project/video
      let url = this.serviceURL+"/videos/"+videoId+"/feedbacks";

      await axios
      .get(url)
      .then(response => {
        // Hookup the feedbacks
        this.feedbacks = response.data;
        //check for commentable
        let project = this.projects.find(element => element.video.videoId == videoId);
        if(project.commentable){
          // Already commented? Read-only for you!
          for(f in this.feedbacks){
            if(this.feedbacks[f].userId == this.userId){
              project.commentable = false;
              break;
            }
          }
        }
      })
      .catch(e => {
        alert("Unable to load the feedback data");
        console.log(e);
      });
    },
    
    async postFeedback(projectId){

      if(this.selectedProject.feedback == "") {
        alert("Add feedback first.");
        return;
      }
      let videoId = this.selectedProject.video.videoId;
      let url = this.serviceURL+"/videos/"+videoId+"/feedbacks";
      let feedback = { 
        "videoComment": this.selectedProject.feedback,
        "videoLike": this.selectedProject.like
      }
      await axios
      .post(url, feedback)
      .then(response => {
        if (response.status == 201) {
          // Insert feedback into this.feedbacks
          feedback.feedbackSince = " ";
          feedback.userFullName = this.userFullName;
          feedback.userName = this.userName;
          this.feedbacks.push(feedback);

          // increment video.nLikes if warranted
          if(feedback.videoLike) this.selectedProject.video.nLikes++;

          // No more commmenting for you!
          this.selectedProject.commentable = false; 
        }
      })
      .catch(e => {
        alert("Unable to post feedback.");
        console.log(e);
      });
    },

    showModal() {
      this.editModal = true;
    },

    hideModal() {
      this.editModal = false;
    },

    feedbackModal(projectId) {
      this.selectedProject = this.projects.find(element => element.projectId == projectId);

      this.getFeedbacks(this.selectedProject.video.videoId);
      this.showModal();
    },

    showStuff(thing){
      alert(thing);
    }


  }
  //------- END methods --------

});

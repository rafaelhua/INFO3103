angular.module('SigninApp', [])
    .controller('SigninController', ['$scope', '$http', function($scope, $http) {

    $scope.welcome = 'Welcome';

    $scope.signin = function (user){
        credentials = JSON.stringify({"username": user.username, "password": user.password});
        $http.post('https://info3103.cs.unb.ca:8024/signin', credentials ).then(function(data) {
            if(data.status == 201) {
                $http.get('https://info3103.cs.unb.ca:8024/hello').then( function(data){
                $scope.welcome = data.data.message;
                $scope.collapse("signinForm");
                $scope.display("NewPostForm");
                $scope.display("logout");
                $scope.display("allPosts");
                $scope.user.password = "";
            });
                $scope.fetchposts();
        }
    });
    }

    $scope.collapse = function(formID){
        var id = formID;
        document.getElementById(id).style.display = "none";    
    }

    $scope.display = function(formID){
        var id = formID;
        document.getElementById(id).style.display = "block";
    }

    $scope.logout = function() {
         $http.delete('https://info3103.cs.unb.ca/signin').then(function(data) {
                   if(data.status == 200) {
                $scope.welcome = 'Welcome';
                $scope.display("signinForm");
                $scope.collapse("NewPostForm");
                $scope.collapse("logout");
                $scope.collapse("allPosts");
            }});
    }

    $scope.fetchposts = function(){
        $http.get('https://info3103.cs.unb.ca:8024/blogpost').then( function(data){
             $scope.myData = data.data.blogpost;
        });    
    }
    
    $scope.newBlog = function (blog){
             post = JSON.stringify({"blogtitle": blog.title, "blogpost": blog.npost, "user": $scope.user.username});
           $http.post('https://info3103.cs.unb.ca:8024/blogpost', post).then(function(data) {
            if(data.status == 200) {
            	$scope.fetchposts();
		$scope.blog.title = "";
		$scope.blog.npost = "";
	     }});
        }

    $scope.deletePost = function (x){
        $http.delete('https://info3103.cs.unb.ca:8024/blogpost/'+ x.PostID).then(function(data) {
                   if(data.status == 200) {
              		$scope.fetchposts();  
            }});
    }

    $scope.getComment = function (x){
        $http.get('https://info3103.cs.unb.ca:8024/comments/' + x.PostID).then(function(data) {
             x.myComments = data.data.comments;
		
        });    
    }

     $scope.newComment = function (comment, x) {
        postcomment = JSON.stringify({"user": $scope.user.username, "commentpost": comment.ncomment, "postid": x.PostID});
        $http.post('https://info3103.cs.unb.ca:8024/comments', postcomment).then(function(data){
        	if(data.status == 200) {
			$scope.getComment(x); 
        	}
	});
    }
}]);


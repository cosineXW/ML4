let commentsDiv = document.getElementById("comments-div");
let profileImages=[];

function preload() {
    // GH: this is not needed, as we only need to set the
    // url as the <img> element source below (the browser
    // takes care of the rest)
    for (let i = 0; i < 20; i++) {
        let url = "assets/p" + (i + 1) + ".jpg"; // Adjusted to load p1.jpg to p20.jpg
        let img = new Image();
        img.src = url;
        profileImages.push(img);
    }
}

function updateComments(response) {
    for (let i = 0; i < response.length; i++) {
        let comment = document.createElement("div");
        comment.className = "comment-div";
        commentsDiv.appendChild(comment);
        comment.style.display = "flex";

        // div for user profile
        let imgDiv=document.createElement("div");
        imgDiv.className="img-div";
        comment.appendChild(imgDiv);
        
        let img = document.createElement("img");
        img.className="profile-img";
        img.src = "assets/p" + (i + 1) + ".jpg";
        imgDiv.appendChild(img);

        // div for texts (ID + Comment)
        let txtDiv = document.createElement("div");
        txtDiv.className="txt-div";
        comment.appendChild(txtDiv);
        txtDiv.style.padding = "1vw";

        let ID = document.createElement("p");
        ID.className="id";
        ID.textContent = response[i].id;
        txtDiv.appendChild(ID);
        let Comment = document.createElement("p");
        Comment.className="comment";
        Comment.textContent = response[i].comment;
        txtDiv.appendChild(Comment);
    }
}
function displayAction(){
    let bar3 = document.getElementById("bar3");
    bar3.style.display = "block";
    let commenttitle= document.getElementById("comment-title");
    commenttitle.style.display= "block";
    let bar = document.getElementById("bar");
    bar.style.display = "none";
    let bar2 = document.getElementById("bar2");
    bar2.style.display = "block";
    let loading = document.getElementById("loadingdiv");
    loading.style.display = "none";
    

}
function submittedAction() {
    commentsDiv.style.display = "block";
    let loading = document.getElementById("loadingdiv");
    loading.style.display = "block";
    
    let all = document.getElementById("all");
    all.style.display = "none";
    sendMessage();
}
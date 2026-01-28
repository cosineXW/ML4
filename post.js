let uploadedImage;
let userInput = "";
let commentArray = [];

function setup() {
  noCanvas();
  
  // 【重要修改 1】这里不能直接调 sendMessage，
  // 而要调用 comment.js 里的 submittedAction，因为它负责切换到 Loading 界面
  // submittedAction 内部会自动调用 sendMessage
  select("#submit-btn").mouseClicked(submittedAction); 
  
  select("#file-input").elt.addEventListener('change', handleFileSelect);
}

function handleFileSelect(event) {
  let file = event.target.files[0];
  if (file && file.type.startsWith('image')) {
    uploadedImage = loadImage(URL.createObjectURL(file));
    let objectUrl = URL.createObjectURL(file);
    select("#file-img").elt.src = objectUrl;
    select("#comment-post-img").elt.src = objectUrl;
  }
}

// 异步发送消息
async function sendMessage() {
  // 获取输入内容
  let content = select("#input-text").value();
  select("#comment-post-caption").html(content);
  userInput = content;
  
  // 处理图片
  let dataUrl;
  if (uploadedImage) {
    uploadedImage.resize(512, 0); 
    uploadedImage.loadPixels();
    dataUrl = uploadedImage.canvas.toDataURL();
  }

  // 准备 Prompt
  let messages = [];
  let systemPrompt = "Imagine you are a netizen viewing others' posting text on social media. Now I want you to give comment on it like real people do. I need a list of 20 userIDs and comments. comments can be humorous or serious and positive or negative. The userID and the comment should be the same language as the user input. Respond as valid JSON without any prefix. Use the properties \"id\" and \"comment\" for each comment.";

  if (uploadedImage) {
    messages = [
      {
        role: "user",
        content: [
          { type: "text", text: systemPrompt + " Here are the user's blog: " + content },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ];
  } else {
    messages = [
      {
        role: "user",
        content: [
          { type: "text", text: systemPrompt + " Here are the user's blog: " + content }
        ],
      },
    ];
  }
  
  // 清空输入框
  select("#input-text").value("");
  
  // --- 发送请求 ---
  const url = "https://itp-ima-replicate-proxy.web.app/api/create_n_get";
  // 填入你的 Token
  let authToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFjMzIxOTgzNGRhNTBlMjBmYWVhZWE3Yzg2Y2U3YjU1MzhmMTdiZTEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiWWlyZW4gWmhhbmciLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTHZJU29ZV2JEQkpMZTI0SFE3M2xkRXVCQTR5VS1UTDJlcFV1ZzYyY0hEemFvQXdwMD1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9pdHAtaW1hLXJlcGxpY2F0ZS1wcm94eSIsImF1ZCI6Iml0cC1pbWEtcmVwbGljYXRlLXByb3h5IiwiYXV0aF90aW1lIjoxNzY5NjMxNTU2LCJ1c2VyX2lkIjoiT25aYkhpMURBVlFsN0JQRUhSc0JNZEJXVTR5MiIsInN1YiI6Ik9uWmJIaTFEQVZRbDdCUEVIUnNCTWRCV1U0eTIiLCJpYXQiOjE3Njk2MzE1NTYsImV4cCI6MTc2OTYzNTE1NiwiZW1haWwiOiJ5ejEwNDQ0QG55dS5lZHUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjEwMzQ1NzQyNzA4OTk0NTkzODUzMCJdLCJlbWFpbCI6WyJ5ejEwNDQ0QG55dS5lZHUiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJnb29nbGUuY29tIn19.loN1cu7zKRv7xAFEZddpUf8fJV8fPfZAlItzYmt7mh0hmoGYH8RAtycyqYRNDTjxoODgHPtsXPUFt-DXmQNjLgsLHwg_YYou_JRr5N1Mxbx_LDxpuSykv92e4iBeF2QXa_RAb84fn9NLCt3UhMssUQVf-YUA1iwPHUrt0EIY7u9fK44ADd3AGZMdY7-OVdsgF0MkaKhQZtPYXKkHpJWlnn_OIvQ2Tc68vJVfmZD5jXxQHsI0fiPnjg-A3dNWyENFRUO0kz_EjLTZdTLElCyakqi1Ce2VFUH4UwVVk5xvAxiValpdoat5p0Ob3NKkohzlhqpLDXhDkMwm4VKnx4PVUg"; 

  console.log("Sending request...");

  const data = {
    model: "openai/gpt-4o", 
    input: { messages: messages },
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  };

  try {
    const raw_response = await fetch(url, options);
    const json_response = await raw_response.json();
    
    console.log("Raw Response:", json_response);

    if (json_response.output) {
      let resultText = json_response.output.join("");
      console.log("Full Result Text:", resultText);
      pushInputToArray(resultText);
    } else {
      console.error("No output in response", json_response);
    }

  } catch (error) {
    console.error("Fetch error:", error);
  }
}

function pushInputToArray(input) {
  let commentsArray = [];
  try {
    input = input.replace(/```json/g, '');
    input = input.replace(/```/g, '');
    input = input.trim();
    
    commentsArray = JSON.parse(input);
    console.log("Parsed Comments:", commentsArray);
  } catch (e) {
    console.log('Got invalid JSON back from GPT', e);
    return;
  }
  
  // 调用 comment.js 里的 updateComments
  updateComments(commentsArray); 
  
  if (commentsArray.length > 0) {
     // 【重要修改 2】取消注释这行！
     // displayAction 在 comment.js 里，它负责隐藏 Loading 动画并显示结果
     displayAction(); 
  }
}

function draw() {
  // 空循环
}

// 【重要修改 3】删除了这里原有的 updateComments 函数
// 因为你的 comment.js 里已经有一个写好的 updateComments 了
// 如果这里不删，会覆盖掉那个能真正生成 HTML 的函数
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
let systemPrompt = "You are the AI citizen for a social media simulation game. Your goal is to generate 20 user ids(not user1 user2 but looks like a real person's. id and comments should use the same language as the ) and comments that reflect the DIVERSE and CHAOTIC nature of the real internet. I need a mix of the following personas: 1. Overly supportive, using emojis like heart and fire. 2. Cynical, unimpressed, or thinks the post is fake/staged (Focus on the vibe/background/quality). 3. Dismissive, acting like nobody cares. 4. The Bot/Spam: Randomly asking people to check their bio or crypto scams. Language: Match the language of the user's input. Respond as valid JSON without any prefix. Use the properties \"id\" and \"comment\" for each comment.";

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
let authToken = "";
  console.log("Sending request...");

  const data = {
    model: "openai/gpt-5", 
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

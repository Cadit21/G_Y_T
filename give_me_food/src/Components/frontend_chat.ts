<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Food Canteen Chat Support</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      color: #333;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      display: flex;
      gap: 20px;
    }
    
    .panel {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 20px;
    }
    
    /* USER PANEL */
    .user-panel {
      flex: 1;
      max-width: 450px;
    }
    
    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
      margin-bottom: 20px;
    }
    
    .chat-title {
      font-size: 18px;
      font-weight: 600;
      color: #4a4a4a;
    }
    
    .chat-messages {
      height: 350px;
      overflow-y: auto;
      padding: 10px 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .message {
      max-width: 80%;
      padding: 10px 15px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
      position: relative;
    }
    
    .bot-message {
      background-color: #f0f0f0;
      align-self: flex-start;
      border-bottom-left-radius: 5px;
    }
    
    .user-message {
      background-color: #0084ff;
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 5px;
    }
    
    .options-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    
    .option-button {
      background-color: #fff;
      border: 1px solid #0084ff;
      color: #0084ff;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .option-button:hover {
      background-color: #0084ff;
      color: white;
    }
    
    .chat-input {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    
    .input-field {
      flex: 1;
      padding: 12px 15px;
      border-radius: 20px;
      border: 1px solid #ddd;
      outline: none;
    }
    
    .send-button {
      background-color: #0084ff;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    
    .user-profile {
      padding: 15px;
      background-color: #f8f8f8;
      border-radius: 8px;
      margin-top: 20px;
      font-size: 14px;
    }
    
    .profile-title {
      font-weight: 600;
      margin-bottom: 10px;
    }
    
    .profile-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    
    /* ADMIN PANEL */
    .admin-panel {
      flex: 2;
    }
    
    .tabs {
      display: flex;
      border-bottom: 1px solid #eee;
      margin-bottom: 20px;
    }
    
    .tab {
      padding: 10px 20px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .tab.active {
      border-bottom: 2px solid #0084ff;
      color: #0084ff;
    }
    
    .admin-container {
      display: flex;
      gap: 20px;
      height: 500px;
    }
    
    .tickets-list {
      flex: 1;
      border-right: 1px solid #eee;
      padding-right: 20px;
      overflow-y: auto;
    }
    
    .ticket {
      padding: 15px;
      border-radius: 8px;
      background-color: #f8f8f8;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .ticket:hover {
      background-color: #f0f0f0;
    }
    
    .ticket.active {
      background-color: #e6f2ff;
      border-left: 3px solid #0084ff;
    }
    
    .ticket-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    
    .ticket-title {
      font-weight: 600;
      font-size: 14px;
    }
    
    .ticket-time {
      font-size: 12px;
      color: #777;
    }
    
    .ticket-preview {
      font-size: 13px;
      color: #555;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .ticket-tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      margin-top: 5px;
    }
    
    .tag-refund {
      background-color: #ffeded;
      color: #ff5555;
    }
    
    .tag-status {
      background-color: #e9f5ff;
      color: #0084ff;
    }
    
    .tag-complaint {
      background-color: #fff8e6;
      color: #ffa500;
    }
    
    .admin-chat {
      flex: 2;
      display: flex;
      flex-direction: column;
    }
    
    .admin-chat-header {
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
      margin-bottom: 15px;
    }
    
    .chat-user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #555;
    }
    
    .user-details h3 {
      margin: 0;
      font-size: 16px;
    }
    
    .user-details p {
      margin: 0;
      font-size: 13px;
      color: #777;
    }
    
    .admin-messages {
      flex: 1;
      overflow-y: auto;
      padding: 10px 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .admin-input {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 20px;
    }
    
    .quick-responses {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 10px;
    }
    
    .quick-response {
      background-color: #f0f0f0;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 13px;
      white-space: nowrap;
      cursor: pointer;
    }
    
    .admin-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }
    
    .admin-action {
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .action-refund {
      background-color: #ffeded;
      color: #ff5555;
      border: 1px solid #ffcaca;
    }
    
    .action-resolve {
      background-color: #e9fff0;
      color: #00c853;
      border: 1px solid #c7f0d8;
    }
    
    .action-escalate {
      background-color: #fff8e6;
      color: #ffa500;
      border: 1px solid #ffe0a3;
    }
    
    .user-context {
      flex: 1;
      border-left: 1px solid #eee;
      padding-left: 20px;
      font-size: 14px;
    }
    
    .context-section {
      margin-bottom: 20px;
    }
    
    .context-title {
      font-weight: 600;
      margin-bottom: 10px;
      font-size: 15px;
    }
    
    .order-item {
      padding: 8px;
      border-radius: 6px;
      background-color: #f8f8f8;
      margin-bottom: 8px;
    }
    
    .order-id {
      font-weight: 500;
      font-size: 13px;
    }
    
    .order-details {
      font-size: 12px;
      color: #555;
      margin-top: 3px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- USER PANEL -->
    <div class="panel user-panel">
      <div class="chat-header">
        <div class="chat-title">Customer Support</div>
        <div style="color: #0084ff; font-size: 14px;">Online</div>
      </div>
      
      <div class="chat-messages">
        <div class="message bot-message">
          Hi there! I'm your Food Canteen support assistant. How can I help you today?
        </div>
        
        <div class="options-container">
          <button class="option-button">Check Order Status</button>
          <button class="option-button">Report Food Issue</button>
          <button class="option-button">Request Refund</button>
          <button class="option-button">Delivery Problems</button>
          <button class="option-button">Payment Issues</button>
        </div>
        
        <div class="message user-message">
          Request Refund
        </div>
        
        <div class="message bot-message">
          I'd be happy to help with your refund request. Could you please tell me the reason for the refund?
        </div>
        
        <div class="options-container">
          <button class="option-button">Food quality issue</button>
          <button class="option-button">Wrong order received</button>
          <button class="option-button">Excessive delay</button>
          <button class="option-button">Order never arrived</button>
        </div>
        
        <div class="message user-message">
          Food quality issue
        </div>
        
        <div class="message bot-message">
          I'm sorry to hear about the food quality issue. Could you provide your order number so I can look into this for you?
        </div>
        
        <div class="message user-message">
          Order #FC-2025-28756
        </div>
        
        <div class="message bot-message">
          Thank you for providing your order number. I can see this was an order for Chicken Pasta from Italiano Canteen placed about 45 minutes ago.
          
          Would you like to:
        </div>
        
        <div class="options-container">
          <button class="option-button">Request full refund</button>
          <button class="option-button">Request partial refund</button>
          <button class="option-button">Replace the order</button>
          <button class="option-button">Speak to a support agent</button>
        </div>
        
        <div class="message user-message">
          Request full refund
        </div>
        
        <div class="message bot-message">
          I understand you'd like a full refund. Could you please upload a photo of the food quality issue to help us improve our service?
        </div>
      </div>
      
      <div class="chat-input">
        <input type="text" class="input-field" placeholder="Type a message...">
        <button class="send-button">→</button>
      </div>
      
      <div class="user-profile">
        <div class="profile-title">Your Order</div>
        <div class="profile-item">
          <span>Order #:</span>
          <span>FC-2025-28756</span>
        </div>
        <div class="profile-item">
          <span>Placed:</span>
          <span>Today, 12:35 PM</span>
        </div>
        <div class="profile-item">
          <span>Total:</span>
          <span>$15.99</span>
        </div>
        <div class="profile-item">
          <span>Status:</span>
          <span style="color: #00c853;">Delivered</span>
        </div>
      </div>
    </div>
    
    <!-- ADMIN PANEL -->
    <div class="panel admin-panel">
      <div class="tabs">
        <div class="tab active">Active Chats (12)</div>
        <div class="tab">Pending (5)</div>
        <div class="tab">Resolved (23)</div>
      </div>
      
      <div class="admin-container">
        <div class="tickets-list">
          <div class="ticket active">
            <div class="ticket-header">
              <div class="ticket-title">John Smith</div>
              <div class="ticket-time">2 min ago</div>
            </div>
            <div class="ticket-preview">Food quality issue - Request full refund</div>
            <span class="ticket-tag tag-refund">Refund</span>
          </div>
          
          <div class="ticket">
            <div class="ticket-header">
              <div class="ticket-title">Maria Rodriguez</div>
              <div class="ticket-time">5 min ago</div>
            </div>
            <div class="ticket-preview">Where is my order? It's been over an hour</div>
            <span class="ticket-tag tag-status">Order Status</span>
          </div>
          
          <div class="ticket">
            <div class="ticket-header">
              <div class="ticket-title">Alex Johnson</div>
              <div class="ticket-time">12 min ago</div>
            </div>
            <div class="ticket-preview">There are missing items in my order</div>
            <span class="ticket-tag tag-complaint">Complaint</span>
          </div>
          
          <div class="ticket">
            <div class="ticket-header">
              <div class="ticket-title">Sarah Williams</div>
              <div class="ticket-time">18 min ago</div>
            </div>
            <div class="ticket-preview">Payment was charged twice for one order</div>
            <span class="ticket-tag tag-refund">Payment</span>
          </div>
          
          <div class="ticket">
            <div class="ticket-header">
              <div class="ticket-title">David Lee</div>
              <div class="ticket-time">24 min ago</div>
            </div>
            <div class="ticket-preview">How do I add a special request to my order?</div>
            <span class="ticket-tag tag-status">General</span>
          </div>
        </div>
        
        <div class="admin-chat">
          <div class="admin-chat-header">
            <div class="chat-user-info">
              <div class="user-avatar">JS</div>
              <div class="user-details">
                <h3>John Smith</h3>
                <p>Order #FC-2025-28756 | Premium Member</p>
              </div>
            </div>
          </div>
          
          <div class="admin-messages">
            <div class="message bot-message">
              Hi there! I'm your Food Canteen support assistant. How can I help you today?
            </div>
            
            <div class="message user-message">
              Request Refund
            </div>
            
            <div class="message bot-message">
              I'd be happy to help with your refund request. Could you please tell me the reason for the refund?
            </div>
            
            <div class="message user-message">
              Food quality issue
            </div>
            
            <div class="message bot-message">
              I'm sorry to hear about the food quality issue. Could you provide your order number so I can look into this for you?
            </div>
            
            <div class="message user-message">
              Order #FC-2025-28756
            </div>
            
            <div class="message bot-message">
              Thank you for providing your order number. I can see this was an order for Chicken Pasta from Italiano Canteen placed about 45 minutes ago.
              
              Would you like to:
            </div>
            
            <div class="message user-message">
              Request full refund
            </div>
            
            <div class="message bot-message">
              I understand you'd like a full refund. Could you please upload a photo of the food quality issue to help us improve our service?
            </div>
          </div>
          
          <div class="admin-input">
            <div class="quick-responses">
              <div class="quick-response">I apologize for the inconvenience</div>
              <div class="quick-response">Your refund has been processed</div>
              <div class="quick-response">We've contacted the restaurant</div>
              <div class="quick-response">Can you provide more details?</div>
              <div class="quick-response">We'll add compensation to your account</div>
            </div>
            
            <div style="display: flex; gap: 10px;">
              <input type="text" class="input-field" placeholder="Type your response...">
              <button class="send-button">→</button>
            </div>
            
            <div class="admin-actions">
              <button class="admin-action action-refund">Process Refund</button>
              <button class="admin-action action-resolve">Resolve Ticket</button>
              <button class="admin-action action-escalate">Escalate to Manager</button>
            </div>
          </div>
        </div>
        
        <div class="user-context">
          <div class="context-section">
            <div class="context-title">Customer Information</div>
            <div class="profile-item">
              <span>Name:</span>
              <span>John Smith</span>
            </div>
            <div class="profile-item">
              <span>Member Since:</span>
              <span>June 2024</span>
            </div>
            <div class="profile-item">
              <span>Status:</span>
              <span style="color: #0084ff;">Premium Member</span>
            </div>
            <div class="profile-item">
              <span>Total Orders:</span>
              <span>47</span>
            </div>
            <div class="profile-item">
              <span>Previous Issues:</span>
              <span>2</span>
            </div>
          </div>
          
          <div class="context-section">
            <div class="context-title">Recent Orders</div>
            
            <div class="order-item">
              <div class="order-id">Order #FC-2025-28756 (Current)</div>
              <div class="order-details">Chicken Pasta - $15.99</div>
              <div class="order-details">Feb 26, 2025, 12:35 PM</div>
            </div>
            
            <div class="order-item">
              <div class="order-id">Order #FC-2025-27489</div>
              <div class="order-details">Veggie Burger Combo - $12.50</div>
              <div class="order-details">Feb 23, 2025, 7:15 PM</div>
            </div>
            
            <div class="order-item">
              <div class="order-id">Order #FC-2025-26371</div>
              <div class="order-details">Chicken Pasta - $15.99</div>
              <div class="order-details">Feb 19, 2025, 1:20 PM</div>
            </div>
          </div>
          
          <div class="context-section">
            <div class="context-title">Previous Support Cases</div>
            
            <div class="order-item">
              <div class="order-id">Case #1254 - Resolved</div>
              <div class="order-details">Missing items in delivery</div>
              <div class="order-details">Jan 17, 2025</div>
            </div>
            
            <div class="order-item">
              <div class="order-id">Case #843 - Resolved</div>
              <div class="order-details">Late delivery compensation</div>
              <div class="order-details">Nov 30, 2024</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
import { Task } from './taskService';

// For demo purposes, we'll use a simple email service
// In production, you would use a proper email service like SendGrid, AWS SES, etc.
export const sendTaskReminderEmail = async (task: Task, recipientEmail: string) => {
  try {
    // In a production environment, this would integrate with an email service
    // For now, we'll just log the email that would be sent
    const emailContent = {
      to: recipientEmail,
      subject: `Task Reminder: ${task.title}`,
      body: `
        Hello,

        This is a reminder about your assigned task:

        Task: ${task.title}
        Description: ${task.description}
        Deadline: ${task.deadline.toLocaleDateString()}
        Priority: ${task.priority}

        Please ensure this task is completed by the deadline.

        If you have any questions, please contact the task creator.

        Best regards,
        Civisight Team
      `
    };

    console.log('Would send email:', emailContent);

    // In production, you would use a service like SendGrid, AWS SES, or Firebase Cloud Functions
    // Example with SendGrid:
    // await sgMail.send({
    //   to: recipientEmail,
    //   from: 'noreply@civisight.com',
    //   subject: emailContent.subject,
    //   text: emailContent.body
    // });

    return true;
  } catch (error) {
    console.error('Error sending task reminder email:', error);
    throw error;
  }
}; 
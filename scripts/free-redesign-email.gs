/**
 * Add this helper to the existing Google Apps Script project.
 *
 * After the existing doPost(e) validates Turnstile and saves the submission,
 * call:
 *
 *   if (e.parameter.requestType === "free_website_redesign") {
 *     sendFreeRedesignEmails_(e.parameter);
 *   }
 *
 * Keep the existing doPost response and deployment URL unchanged.
 */
function sendFreeRedesignEmails_(fields) {
  var ownerEmail = "help@daytongrowth.co";
  var customerEmail = fields.customerEmail || fields.emailAddress || fields.email;
  var customerName = fields.yourName || "there";
  var businessName = fields.businessName || "Not provided";
  var websiteUrl = fields.websiteUrl || "Not provided";

  MailApp.sendEmail({
    to: ownerEmail,
    replyTo: customerEmail,
    subject: "Free website redesign request — " + businessName,
    body:
      "New free website redesign request\n\n" +
      "Name: " + customerName + "\n" +
      "Business: " + businessName + "\n" +
      "Email: " + customerEmail + "\n" +
      "Website: " + websiteUrl + "\n\n" +
      "Source: Systems That Pay landing page"
  });

  if (fields.sendCustomerConfirmation === "true" && customerEmail) {
    MailApp.sendEmail({
      to: customerEmail,
      replyTo: ownerEmail,
      name: "DaytonGrowthCo.",
      subject: "We received your free website redesign request",
      body:
        "Hi " + customerName + ",\n\n" +
        "We received your request for a free homepage redesign concept for " +
        businessName + ".\n\n" +
        "We’ll review " + websiteUrl + " and follow up by email with the next step.\n\n" +
        "The concept includes a homepage direction, stronger messaging and structure, " +
        "and mobile-first recommendations. There is no obligation and no automatic sales call.\n\n" +
        "DaytonGrowthCo.\n" +
        "help@daytongrowth.co"
    });
  }
}

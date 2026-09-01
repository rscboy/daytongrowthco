export type ObjectionCategory = "Decision" | "Investment" | "Trust" | "Timing" | "Authority" | "Fit";

export type Objection = {
  id: string;
  title: string;
  category: ObjectionCategory;
  signal: string;
  say: string;
  questions: string[];
  listenFor: string;
  nextMove: string;
  avoid: string;
};

export const objections: Objection[] = [
  {
    id: "think-about-it",
    title: "I need to think about it",
    category: "Decision",
    signal: "A placeholder objection. The real concern is usually investment, timing, trust, authority, or fit.",
    say: "Totally understand. It is a real decision. Can I ask what specifically you need to think about? Is it the investment, the process, the timing, or something else? I would rather work through any concern now while we are together than leave you with an unanswered question.",
    questions: [
      "What part still feels unresolved?",
      "If we cleared that up, would you feel comfortable moving forward?",
    ],
    listenFor: "The first concrete concern they name. Do not answer until you can repeat the real issue back clearly.",
    nextMove: "Open the matching objection in this playbook, resolve it, then ask whether that answers the concern.",
    avoid: "Do not accept a vague delay, fill the silence, or start pitching the whole offer again.",
  },
  {
    id: "too-expensive",
    title: "It is too expensive",
    category: "Investment",
    signal: "You need to separate a real cash constraint from uncertainty about the return.",
    say: "I hear you, and I want to make sure this makes sense financially. Is it that the budget genuinely is not there right now, or is it more that you want to be sure the return justifies the investment?",
    questions: [
      "What is the inconsistent review flow costing you in missed trust or booked work today?",
      "What result would make the investment feel justified?",
    ],
    listenFor: "No available budget versus an unclear payoff. Those require different responses.",
    nextMove: "If it is value, reconnect the $2,000 founding-client price to the cost they described and the review-flow problem it solves. If the budget truly is not there, reduce scope only if delivery still works or agree on an honest future date.",
    avoid: "Do not discount automatically, invent ROI, or tell them they cannot afford to wait unless their own numbers support it.",
  },
  {
    id: "partner",
    title: "I need to talk to my partner or team",
    category: "Authority",
    signal: "A real stakeholder may be missing, or the prospect may be borrowing someone else's authority to delay.",
    say: "Of course. Decisions like this should include the right people. What do you think their main concern will be? If it helps, I am happy to join a quick call with both of you so I can answer anything directly.",
    questions: [
      "If it were only your decision, would you want to move forward?",
      "Who else needs to be comfortable, and what will matter most to them?",
    ],
    listenFor: "Whether the prospect is personally sold and the name, role, and concern of the actual decision-maker.",
    nextMove: "Book a specific 10–15 minute decision call with every stakeholder. Send a short recap they can forward before it.",
    avoid: "Do not ask them to sell the service for you or pressure them to decide without the other stakeholder.",
  },
  {
    id: "burned-before",
    title: "We have been burned before",
    category: "Trust",
    signal: "Their past experience is shaping the risk they see in your offer. Their scar tells you what must be different.",
    say: "I am sorry to hear that, and I understand why you would be careful. What specifically went wrong last time? I want to address that directly instead of giving you a generic promise.",
    questions: [
      "Where did the last provider or system break down?",
      "What would you need to see from us to feel that this is being managed differently?",
    ],
    listenFor: "Poor communication, weak implementation, missing reporting, bad-fit software, surprise costs, or promises that were never defined.",
    nextMove: "Reflect the exact failure back, then show the relevant safeguard in your real process. Explain only guarantees and reporting you actually provide.",
    avoid: "Do not insult the old provider, minimize their experience, or claim DaytonGrowthCo can never make a mistake.",
  },
  {
    id: "guarantee",
    title: "Can you guarantee results?",
    category: "Trust",
    signal: "They want the risk defined. Answer with controllable commitments and honest qualification.",
    say: "I do not want to promise a result we cannot control. Review volume depends on eligible customer volume, participation, and the health of the Google profile. What I can do is explain exactly what we manage, what we measure, and any written guarantee that applies after we confirm you qualify.",
    questions: [
      "Which result are you most concerned about: setup, request volume, or reviews received?",
      "About how many eligible completed customer events do you have each month?",
    ],
    listenFor: "The exact outcome they expect and whether their customer volume can realistically support it.",
    nextMove: "Qualify volume and software first. State the written terms plainly. If they do not qualify, say so.",
    avoid: "Never invent proof, promise a fixed number of customers or revenue, or present a conditional guarantee as universal.",
  },
  {
    id: "compare",
    title: "I am comparing a few options",
    category: "Decision",
    signal: "They are still choosing criteria. Help them compare on fit instead of turning the call into a feature contest.",
    say: "That makes sense. You should compare. What other approaches are you considering, and what will matter most when you decide?",
    questions: [
      "Are you comparing software, a managed service, or keeping the process in-house?",
      "Which matters most: integration, team workload, reporting, support, or price?",
    ],
    listenFor: "Their real decision criteria and whether they understand the difference between software access and a managed workflow.",
    nextMove: "Differentiate only on verified facts: managed implementation, fit with their workflow, honest-customer requests, reporting, and support. Recommend another path if it fits better.",
    avoid: "Do not trash competitors, manufacture urgency, or claim a feature you have not confirmed.",
  },
  {
    id: "timing",
    title: "The timing is not right",
    category: "Timing",
    signal: "Timing can be a real operating constraint or a safe way to postpone a difficult decision.",
    say: "I respect that. What would need to change for the timing to be right?",
    questions: [
      "Is the constraint team capacity, software changes, cash flow, seasonality, or something else?",
      "What happens to the current review process if nothing changes for the next three months?",
    ],
    listenFor: "A concrete event and date. Vague future language usually means another objection is underneath it.",
    nextMove: "If the constraint is real, schedule a specific follow-up tied to that event. If it is vague, isolate the concern. Use only the cost of waiting that the prospect described.",
    avoid: "Do not pretend there is no bad time to start or use a fake deadline.",
  },
  {
    id: "send-info",
    title: "Send me information or a proposal",
    category: "Decision",
    signal: "They may need material for a stakeholder, or they may be trying to end the conversation politely.",
    say: "Absolutely. I want to send something useful instead of a generic deck. What does the proposal need to answer for you to make a decision?",
    questions: [
      "Who will review it, and what will each person care about?",
      "If it answers those questions, what would the next step be?",
    ],
    listenFor: "A real evaluation process, stakeholder, decision criteria, and date.",
    nextMove: "Send a recap using their problem, desired outcome, fit, investment, and verified terms. Put a 15-minute review call on the calendar before ending the conversation.",
    avoid: "Do not let a PDF replace discovery or send a long generic capabilities deck with no follow-up date.",
  },
  {
    id: "already-have-system",
    title: "We already ask for reviews",
    category: "Fit",
    signal: "Having a process is different from getting a satisfactory result. This may also be a clean disqualification.",
    say: "That makes sense. Are you happy with how many honest reviews the process actually produces each month, or is there still a gap between completed customers and new reviews?",
    questions: [
      "Is the request fully automatic, and who watches whether it keeps working?",
      "How many eligible completions and new Google reviews do you average each month?",
    ],
    listenFor: "A measurable gap, staff follow-through burden, integration failure, or genuine satisfaction with the current system.",
    nextMove: "If there is a gap, diagnose it before prescribing. If they are happy and the process is compliant, thank them and end the call.",
    avoid: "Do not manufacture a problem, criticize a working system, or imply that every business needs your service.",
  },
  {
    id: "bother-customers",
    title: "I do not want to bother customers",
    category: "Fit",
    signal: "They care about the customer experience. Show restraint and honest-review standards.",
    say: "I agree that the request should never feel pushy. The goal is a simple, well-timed request to every eligible customer for an honest review, with sensible limits. What has felt uncomfortable about the way review requests are handled today?",
    questions: [
      "Is the concern frequency, wording, timing, or asking at all?",
      "What would a respectful follow-up look like for your customers?",
    ],
    listenFor: "Brand sensitivity, an overly aggressive current sequence, special privacy rules, or a misunderstanding of the workflow.",
    nextMove: "Walk through timing and frequency only after learning their concern. Adapt the workflow to their customer experience and industry rules.",
    avoid: "Do not review-gate, ask only happy customers, or dismiss privacy and professional obligations.",
  },
];

export const callPhases = [
  { number: "01", title: "Warm up", detail: "Build brief, real rapport. Set the agenda and get permission to ask direct questions." },
  { number: "02", title: "Diagnose", detail: "Understand the business, current review flow, job volume, software, and what has already been tried." },
  { number: "03", title: "Clarify the cost", detail: "Ask what the inconsistency is costing in staff time, trust, or missed opportunities. Let them supply the number." },
  { number: "04", title: "Build the vision", detail: "Ask what a dependable review process would change six months from now and why that matters personally." },
  { number: "05", title: "Prescribe", detail: "Repeat their problem, explain the mechanism simply, and tie each part of the offer to something they said." },
  { number: "06", title: "Decide", detail: "Clear process questions, state the investment calmly, ask how it feels, and get curious about any objection." },
];

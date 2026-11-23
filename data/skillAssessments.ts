export const skillsByTrade: Record<string, string[]> = {
  Electrician: ["House Wiring", "MCB Installation", "Electrical Maintenance", "Multimeter Usage"],
  Plumber: ["PVC Pipefitting", "CPVC Jointing", "Leak Testing", "Tap Installation"],
  Mason: ["Brick Laying", "Plastering", "Floor Levelling"],
  Welder: ["Arc Welding", "Joint Preparation", "Metal Fabrication"],
};

const instructions: Record<string, string> = {
  Electrician: "Show how you identify wires safely. Do not touch live wires.",
  Plumber: "Show how you prepare and join a pipe. Point out how you check the joint.",
  Mason: "Show how you place a brick and check that it is level and straight.",
  Welder: "Show how you prepare a metal joint before welding. Wear your safety gear.",
};

const localizedInstructions: Record<string, Record<string, string>> = {
  hi: { Electrician: "दिखाएँ कि आप तारों की पहचान कैसे करते हैं। बिजली चालू तार को न छुएँ।", Plumber: "पाइप का जोड़ बनाने का तरीका दिखाएँ। जोड़ को जाँचकर भी दिखाएँ।", Mason: "ईंट रखने का तरीका दिखाएँ। देखें कि ईंट सीधी और बराबर है।", Welder: "वेल्डिंग से पहले जोड़ तैयार करने का तरीका दिखाएँ। सुरक्षा के कपड़े पहनें।" },
  kn: { Electrician: "ತಂತಿಗಳನ್ನು ಹೇಗೆ ಗುರುತಿಸುತ್ತೀರಿ ತೋರಿಸಿ. ವಿದ್ಯುತ್ ಇರುವ ತಂತಿ ಮುಟ್ಟಬೇಡಿ.", Plumber: "ಪೈಪ್ ಜೋಡಿಸುವ ವಿಧಾನ ತೋರಿಸಿ. ಜೋಡಣೆ ಸರಿಯಾಗಿದೆಯೇ ನೋಡಿ.", Mason: "ಇಟ್ಟಿಗೆ ಇಡುವ ವಿಧಾನ ತೋರಿಸಿ. ಇಟ್ಟಿಗೆ ನೇರವಾಗಿದೆಯೇ ನೋಡಿ.", Welder: "ವೆಲ್ಡಿಂಗ್ ಮೊದಲು ಜೋಡಣೆ ಸಿದ್ಧಪಡಿಸುವ ವಿಧಾನ ತೋರಿಸಿ. ಸುರಕ್ಷತಾ ಉಡುಪು ಧರಿಸಿ." },
};

export function assessmentInstruction(trade: string, skill: string, language = "EN") {
  const locale = language === "हिन्दी" ? "hi" : language === "ಕನ್ನಡ" ? "kn" : "en";
  return localizedInstructions[locale]?.[trade] ?? instructions[trade] ?? `Show how you do ${skill}. Tell us the steps you follow.`;
}

const translations: Record<string, Record<string, string>> = {
  hi: {
    "My Skills":"मेरे कौशल", "Skills you have added.":"आपके जोड़े हुए कौशल।", "Add skills":"कौशल जोड़ें", "Your trade":"आपका काम", "Choose skills":"कौशल चुनें", "Find a skill":"कौशल खोजें", "Add selected skills":"चुने कौशल जोड़ें", "Show skill":"कौशल दिखाएँ", "Verified":"जाँचा गया", "Awaiting review":"जाँच बाकी", "Submitted":"भेज दिया", "Not started":"शुरू नहीं", "In progress":"चल रहा है", "Needs another demonstration":"फिर से दिखाएँ", "Remove":"हटाएँ", "No matching skills":"यह कौशल नहीं मिला", "No skills yet":"अभी कोई कौशल नहीं", "Add a skill to begin.":"शुरू करने के लिए कौशल जोड़ें।", "Task":"काम", "Listen":"सुनें", "Start camera":"कैमरा शुरू करें", "Start recording":"रिकॉर्ड शुरू करें", "Stop":"रोकें", "Retake":"फिर से रिकॉर्ड करें", "Submit evidence":"वीडियो जमा करें", "Evidence stays on this device in this demo.":"डेमो में वीडियो इसी फ़ोन पर रहेगा।", "Allow camera and microphone access to record.":"रिकॉर्ड करने के लिए कैमरा और माइक की अनुमति दें।", "Camera preview":"कैमरा देखें", "Recording":"रिकॉर्ड हो रहा है", "Demo only":"सिर्फ डेमो", "Back to skills":"कौशल पर वापस जाएँ", "Assessment result":"जाँच का नतीजा", "Submission date":"जमा करने की तारीख", "Feedback":"सुझाव", "No feedback yet":"अभी कोई सुझाव नहीं", "Human endorsement":"काम की पुष्टि", "Not requested":"नहीं माँगी", "Not verified":"अभी जाँचा नहीं गया", "Video is saved on this device.":"वीडियो इसी फ़ोन पर सेव है।", "Open result":"नतीजा देखें", "Play evidence":"वीडियो चलाएँ", "Assessment":"कौशल जाँच", "This is a demo. No AI checks your work.":"यह डेमो है। AI आपके काम की जाँच नहीं करता।", "Video saved":"वीडियो सेव हो गया", "Select your language":"अपनी भाषा चुनें", "Camera and microphone are not available here.":"यहाँ कैमरा और माइक उपलब्ध नहीं हैं।", "Could not save video. Check device storage.":"वीडियो सेव नहीं हुआ। फ़ोन की जगह जाँचें।"
  },
  kn: {
    "My Skills":"ನನ್ನ ಕೌಶಲ್ಯಗಳು", "Skills you have added.":"ನೀವು ಸೇರಿಸಿದ ಕೌಶಲ್ಯಗಳು.", "Add skills":"ಕೌಶಲ್ಯ ಸೇರಿಸಿ", "Your trade":"ನಿಮ್ಮ ಕೆಲಸ", "Choose skills":"ಕೌಶಲ್ಯ ಆರಿಸಿ", "Find a skill":"ಕೌಶಲ್ಯ ಹುಡುಕಿ", "Add selected skills":"ಆಯ್ದ ಕೌಶಲ್ಯ ಸೇರಿಸಿ", "Show skill":"ಕೌಶಲ್ಯ ತೋರಿಸಿ", "Verified":"ಪರಿಶೀಲಿಸಲಾಗಿದೆ", "Awaiting review":"ಪರಿಶೀಲನೆ ಬಾಕಿ", "Submitted":"ಸಲ್ಲಿಸಲಾಗಿದೆ", "Not started":"ಆರಂಭಿಸಿಲ್ಲ", "In progress":"ನಡೆಯುತ್ತಿದೆ", "Needs another demonstration":"ಮತ್ತೆ ತೋರಿಸಿ", "Remove":"ತೆಗೆದುಹಾಕಿ", "No matching skills":"ಈ ಕೌಶಲ್ಯ ಸಿಗಲಿಲ್ಲ", "No skills yet":"ಇನ್ನೂ ಕೌಶಲ್ಯ ಇಲ್ಲ", "Add a skill to begin.":"ಆರಂಭಿಸಲು ಕೌಶಲ್ಯ ಸೇರಿಸಿ.", "Task":"ಕೆಲಸ", "Listen":"ಕೇಳಿ", "Start camera":"ಕ್ಯಾಮೆರಾ ಪ್ರಾರಂಭಿಸಿ", "Start recording":"ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ", "Stop":"ನಿಲ್ಲಿಸಿ", "Retake":"ಮತ್ತೆ ರೆಕಾರ್ಡ್ ಮಾಡಿ", "Submit evidence":"ವೀಡಿಯೊ ಸಲ್ಲಿಸಿ", "Evidence stays on this device in this demo.":"ಡೆಮೋದಲ್ಲಿ ವೀಡಿಯೊ ಈ ಸಾಧನದಲ್ಲೇ ಇರುತ್ತದೆ.", "Allow camera and microphone access to record.":"ರೆಕಾರ್ಡ್ ಮಾಡಲು ಕ್ಯಾಮೆರಾ ಮತ್ತು ಮೈಕ್ ಅನುಮತಿಸಿ.", "Camera preview":"ಕ್ಯಾಮೆರಾ ನೋಡಿ", "Recording":"ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ", "Demo only":"ಡೆಮೋ ಮಾತ್ರ", "Back to skills":"ಕೌಶಲ್ಯಗಳಿಗೆ ಹಿಂತಿರುಗಿ", "Assessment result":"ಪರಿಶೀಲನೆ ಫಲಿತಾಂಶ", "Submission date":"ಸಲ್ಲಿಸಿದ ದಿನಾಂಕ", "Feedback":"ಸಲಹೆ", "No feedback yet":"ಇನ್ನೂ ಸಲಹೆ ಇಲ್ಲ", "Human endorsement":"ಮಾನವ ದೃಢೀಕರಣ", "Not requested":"ಕೋರಿಲ್ಲ", "Not verified":"ಇನ್ನೂ ಪರಿಶೀಲಿಸಿಲ್ಲ", "Video is saved on this device.":"ವೀಡಿಯೊ ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ.", "Open result":"ಫಲಿತಾಂಶ ನೋಡಿ", "Play evidence":"ವೀಡಿಯೊ ಚಲಾಯಿಸಿ", "Assessment":"ಕೌಶಲ್ಯ ಪರಿಶೀಲನೆ", "This is a demo. No AI checks your work.":"ಇದು ಡೆಮೋ. AI ನಿಮ್ಮ ಕೆಲಸವನ್ನು ಪರಿಶೀಲಿಸುವುದಿಲ್ಲ.", "Video saved":"ವೀಡಿಯೊ ಉಳಿಸಲಾಗಿದೆ", "Select your language":"ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ", "Camera and microphone are not available here.":"ಕ್ಯಾಮೆರಾ ಮತ್ತು ಮೈಕ್ ಲಭ್ಯವಿಲ್ಲ.", "Could not save video. Check device storage.":"ವೀಡಿಯೊ ಉಳಿಸಲಾಗಲಿಲ್ಲ. ಸಾಧನದ ಸ್ಥಳ ಪರಿಶೀಲಿಸಿ."
  }
};

const extraTranslations: Record<string, Record<string, string>> = {
  hi: { "Your skills":"आपके कौशल", "Open profile":"प्रोफ़ाइल खोलें", "All listed skills are in your profile.":"सभी कौशल आपकी प्रोफ़ाइल में हैं।", "Show skill":"कौशल दिखाएँ", "View":"देखें", "Remove":"हटाएँ", "Find a skill":"कौशल खोजें", "Search skills":"कौशल खोजें", "Choose a trade in your profile to add skills.":"कौशल जोड़ने के लिए प्रोफ़ाइल में अपना काम चुनें।", "Add a skill to begin.":"शुरू करने के लिए कौशल जोड़ें।" },
  kn: { "Your skills":"ನಿಮ್ಮ ಕೌಶಲ್ಯಗಳು", "Open profile":"ವಿವರ ತೆರೆಯಿರಿ", "All listed skills are in your profile.":"ಎಲ್ಲಾ ಕೌಶಲ್ಯಗಳು ನಿಮ್ಮ ವಿವರದಲ್ಲಿವೆ.", "Show skill":"ಕೌಶಲ್ಯ ತೋರಿಸಿ", "View":"ನೋಡಿ", "Remove":"ತೆಗೆದುಹಾಕಿ", "Find a skill":"ಕೌಶಲ್ಯ ಹುಡುಕಿ", "Search skills":"ಕೌಶಲ್ಯ ಹುಡುಕಿ", "Choose a trade in your profile to add skills.":"ಕೌಶಲ್ಯ ಸೇರಿಸಲು ನಿಮ್ಮ ವಿವರದಲ್ಲಿ ಕೆಲಸ ಆಯ್ಕೆಮಾಡಿ.", "Add a skill to begin.":"ಆರಂಭಿಸಲು ಕೌಶಲ್ಯ ಸೇರಿಸಿ." }
};

export function assessmentText(text: string, language: string) {
  const locale = language === "हिन्दी" ? "hi" : language === "ಕನ್ನಡ" ? "kn" : "en";
  return translations[locale]?.[text] ?? extraTranslations[locale]?.[text] ?? text;
}


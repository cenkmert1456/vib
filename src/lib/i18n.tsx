import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Lang = "en" | "tr";

const en = {
  // App
  "app.name": "VYBE",
  "app.tagline": "Feel the vibe. Find your people.",
  "nav.discover": "Discover",
  "nav.matches": "Matches",
  "nav.messages": "Messages",
  "nav.activity": "Activity",
  "nav.profile": "Profile",
  "common.loading": "Loading",
  "common.retry": "Try again",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.save": "Save",
  "common.back": "Back",
  "common.close": "Close",
  "common.done": "Done",
  "common.skip": "Skip",
  "common.continue": "Continue",
  "common.next": "Next",
  "common.error": "Something went wrong",
  "common.networkError": "You seem to be offline. Check your connection.",
  "common.oops": "Oops",
  "common.optional": "Optional",
  "common.none": "None",
  "common.kmAway": "{km} km away",
  "common.miAway": "{km} mi away",
  "common.inCity": "In {city}",
  "common.verified": "Verified",
  "common.verificationPending": "Verification pending",
  "common.justNow": "now",
  "common.minutesAgo": "{n}m",
  "common.hoursAgo": "{n}h",
  "common.daysAgo": "{n}d",
  "common.yesterday": "Yesterday",
  "common.loadMore": "Load more",
  "common.gotIt": "Got it",
  "common.online": "Online now",
  "common.activeAgo": "Active {time} ago",
  "common.lastActive": "Last active {time} ago",

  // Landing
  "landing.eyebrow": "Global social discovery",
  "landing.headline": "Find your vibe.",
  "landing.subheadline":
    "Discover people, start conversations, and connect with those who match your energy.",
  "landing.cta": "Get started",
  "landing.openApp": "Open VYBE",
  "landing.logIn": "I already have an account",
  "landing.feature1Title": "Real connections",
  "landing.feature1Desc":
    "Match only with people who feel your energy. No noise, no bots — just vibes.",
  "landing.feature2Title": "Globally yours",
  "landing.feature2Desc":
    "From Istanbul to Tokyo, meet people in your city or across the world.",
  "landing.feature3Title": "Safe by design",
  "landing.feature3Desc":
    "Block, report, and control exactly who sees you. Your approximate location only.",
  "landing.statsUsers": "1M+ vibes shared",
  "landing.statsMatches": "Every 3 seconds a match",
  "landing.statsCountries": "120+ countries",
  "landing.footer": "Made with ♥ for the world. 18+ only.",
  "landing.splashTagline": "Feel the vibe. Find your people.",

  // Auth
  "auth.welcomeBack": "Welcome back",
  "auth.findYourVibe": "Find your vibe.",
  "auth.subtitle":
    "Discover people, start conversations, and connect with those who match your energy.",
  "auth.continueWithApple": "Continue with Apple",
  "auth.continueWithGoogle": "Continue with Google",
  "auth.continueWithEmail": "Continue with Email",
  "auth.alreadyAccount": "Already have an account?",
  "auth.logIn": "Log in",
  "auth.emailTitle": "Your email",
  "auth.emailSubtitle": "We'll send you a secure code. No passwords needed.",
  "auth.emailPlaceholder": "you@example.com",
  "auth.sendCode": "Send code",
  "auth.checkEmail": "Check your email",
  "auth.codeSent": "We've sent a 6-digit code to {email}",
  "auth.codePlaceholder": "Enter the code",
  "auth.verify": "Verify & continue",
  "auth.verifyError": "The code you entered is incorrect. Try again.",
  "auth.resend": "Didn't get a code?",
  "auth.tryAgain": "Try again",
  "auth.useDifferentEmail": "Use a different email",
  "auth.ageNote": "You must be at least 18 to use VYBE.",
  "auth.termsNote": "By continuing you agree to our Terms and Privacy Policy.",
  "auth.providerUnavailable": "Coming soon",
  "auth.providerUnavailableDesc":
    "{provider} sign-in isn't enabled yet. Continue quickly with your email — it takes seconds.",
  "auth.oAuthNote": "Google & Apple sign-in are wired for when keys are added",

  // Onboarding
  "onboard.title": "Create your profile",
  "onboard.subtitle": "A few quick steps and you're in.",
  "onboard.step": "Step {current} of {total}",
  "onboard.nameTitle": "What's your name?",
  "onboard.nameSubtitle": "This is how people will see you on VYBE.",
  "onboard.namePlaceholder": "First name",
  "onboard.nameError": "Please enter your first name.",
  "onboard.birthTitle": "When's your birthday?",
  "onboard.birthSubtitle": "Your age is shown on your profile. You must be 18+.",
  "onboard.ageError": "You must be at least 18 years old.",
  "onboard.birthError": "Please enter a valid date of birth.",
  "onboard.genderTitle": "What's your gender?",
  "onboard.genderSubtitle": "You can change this anytime in settings.",
  "onboard.interestedTitle": "Who are you interested in?",
  "onboard.interestedSubtitle": "Pick one or more. You can change this later.",
  "onboard.locationTitle": "Where are you?",
  "onboard.locationSubtitle":
    "Enable location for better matches. We only ever share an approximate distance.",
  "onboard.allowLocation": "Allow location",
  "onboard.locationDenied": "No problem — pick a city instead.",
  "onboard.cityPlaceholder": "Choose your city",
  "onboard.photosTitle": "Add your photos",
  "onboard.photosSubtitle": "Add at least one photo so people can see your vibe.",
  "onboard.photosHint": "Photos are private until you're ready to share.",
  "onboard.bioTitle": "Tell us about you",
  "onboard.bioSubtitle": "A short bio helps people feel your energy.",
  "onboard.bioPlaceholder":
    "What's your vibe? Coffee dates, hikes, late-night talks…",
  "onboard.bioHint": "{count} characters left",
  "onboard.interestsTitle": "Pick your interests",
  "onboard.interestsSubtitle":
    "Choose a few things you love. Match on vibes, not just looks.",
  "onboard.languagesTitle": "Languages you speak",
  "onboard.verifyTitle": "Verify your profile",
  "onboard.verifySubtitle":
    "Optional. Verified profiles get more matches and a badge.",
  "onboard.verifyLater": "Maybe later",
  "onboard.verifyNow": "Verify now",
  "onboard.verifyDesc": "Take a selfie or upload a clear photo of yourself.",
  "onboard.verifySubmitted":
    "Your verification is in review. You'll get a badge once it's approved.",
  "onboard.doneTitle": "You're all set!",
  "onboard.doneSubtitle": "Welcome to VYBE. Feel the vibe.",
  "onboard.startDiscovering": "Start discovering",
  "onboard.uploading": "Uploading…",

  // Genders
  "gender.woman": "Woman",
  "gender.man": "Man",
  "gender.nonbinary": "Non-binary",
  "gender.other": "Other",

  // Discover
  "discover.title": "Discover",
  "discover.emptyTitle": "You're all caught up",
  "discover.emptyHint":
    "You've seen everyone nearby for now. Come back soon — new vibes land every day.",
  "discover.refresh": "Refresh",
  "discover.pass": "Pass",
  "discover.like": "Like",
  "discover.superVybe": "Super VYBE",
  "discover.tapHint": "Tap the card to view the full profile",
  "discover.matched": "It's a match!",
  "discover.matchedHint":
    "You and {name} liked each other. Say hi before the vibe fades.",
  "discover.likeLimit": "You've reached today's likes. Come back tomorrow!",
  "discover.swipeHint": "Swipe right to like, left to pass, up for Super VYBE",

  // Profile detail
  "profile.about": "About",
  "profile.interests": "Interests",
  "profile.lifestyle": "Lifestyle",
  "profile.languages": "Languages",
  "profile.prompts": "Prompts",
  "profile.shared": "Shared with you",
  "profile.distance": "{distance} away",
  "profile.report": "Report",
  "profile.block": "Block",
  "profile.blockTitle": "Block {name}?",
  "profile.blockDesc":
    "They won't see you, you won't see them, and your chat will be closed. You can unblock later.",
  "profile.reportTitle": "Report {name}?",
  "profile.reportDesc": "Reports are anonymous. Our team reviews every report.",
  "profile.reportCategory": "Reason",
  "profile.reportPlaceholder": "Add details (optional)",
  "profile.reportSubmit": "Submit report",
  "profile.reportDone": "Thanks. Our team will review this report.",
  "profile.blockedToast": "Blocked. You won't see each other anymore.",
  "profile.reportedToast": "Report submitted. Thanks for keeping VYBE safe.",
  "profile.hidePhotos": "Photos",

  // Match moment
  "match.youCaught": "You caught the same VYBE",
  "match.subtitle": "You and {name} liked each other. Make it count.",
  "match.sendMessage": "Send a message",
  "match.keepDiscovering": "Keep discovering",
  "match.newMatch": "New match",

  // Matches
  "matches.title": "Matches",
  "matches.new": "New Matches",
  "matches.recent": "Recent Connections",
  "matches.emptyTitle": "No matches yet",
  "matches.emptyHint":
    "Keep swiping — when two people catch the same VYBE, they show up here.",
  "matches.goDiscover": "Start discovering",
  "matches.sayHi": "Say hi",
  "matches.unmatched": "Unmatched",
  "matches.chatClosed": "Conversation closed",

  // Messages
  "messages.title": "Messages",
  "messages.emptyTitle": "No messages yet",
  "messages.emptyHint": "Your conversations will live here. Match first!",
  "messages.typing": "typing…",
  "messages.placeholder": "Message…",
  "messages.send": "Send",
  "messages.delivered": "Delivered",
  "messages.read": "Read",
  "messages.unmatch": "Unmatch",
  "messages.unmatchTitle": "Unmatch with {name}?",
  "messages.unmatchDesc":
    "The conversation will close for both of you. They can still appear in Discover.",
  "messages.report": "Report",
  "messages.block": "Block",
  "messages.closed": "This conversation is closed.",
  "messages.you": "You",
  "messages.photo": "Photo",
  "messages.attach": "Attach photo",
  "messages.sending": "Sending…",
  "messages.loadEarlier": "Load earlier messages",

  // Activity
  "activity.title": "Activity",
  "activity.today": "Today",
  "activity.thisWeek": "This Week",
  "activity.earlier": "Earlier",
  "activity.emptyTitle": "No activity yet",
  "activity.emptyHint": "Likes, matches and messages will show up here.",
  "activity.likedYou": "liked you",
  "activity.superLikedYou": "sent you a Super VYBE ✨",
  "activity.likeBack": "Like back",
  "activity.sayHi": "Say hi",
  "activity.viewed": "saw your profile",
  "activity.matchPrefix": "You caught the same VYBE with",

  // My profile
  "profile.edit": "Edit profile",
  "profile.settings": "Settings",
  "profile.completion": "Profile {pct}% complete",
  "profile.completionHint": "Complete your profile to get more matches.",
  "profile.verify": "Get verified",
  "profile.verifyPending": "Verification in review",
  "profile.verifyDesc": "Verified profiles get a badge and 2x more matches.",
  "profile.myPhotos": "My photos",
  "profile.addPhoto": "Add photo",
  "profile.removePhoto": "Remove",
  "profile.reorderHint": "Drag to reorder — the first photo is your main one.",
  "profile.bio": "Bio",
  "profile.bioEmpty": "Add a short bio to show your vibe.",
  "profile.interestsEmpty": "Add interests to find people who match your energy.",
  "profile.promptsEdit": "Edit",
  "profile.promptsEmpty": "Add a prompt to start conversations.",
  "profile.saveError": "Couldn't save. Please try again.",
  "profile.savedToast": "Saved!",
  "profile.location": "Location",
  "profile.lifestyleEdit": "Lifestyle",

  // Edit
  "edit.title": "Edit profile",
  "edit.photosTitle": "Photos",
  "edit.bioTitle": "Bio",
  "edit.interestsTitle": "Interests",
  "edit.languagesTitle": "Languages",
  "edit.promptsTitle": "Prompts",
  "edit.promptQuestion": "Question",
  "edit.promptAnswer": "Answer",
  "edit.addPrompt": "Add prompt",
  "edit.removePrompt": "Remove",
  "edit.save": "Save changes",

  // Settings
  "settings.title": "Settings",
  "settings.account": "Account",
  "settings.email": "Email",
  "settings.changePassword": "Change password",
  "settings.passwordNote":
    "VYBE uses secure one-time codes instead of passwords. To sign in, just use your email.",
  "settings.signOutDevice": "Sign out of this device",
  "settings.deleteAccount": "Delete account",
  "settings.deleteTitle": "Delete your account?",
  "settings.deleteDesc":
    "This permanently removes your profile, matches and messages. This can't be undone.",
  "settings.deleteConfirm": "Delete forever",
  "settings.discovery": "Discovery Preferences",
  "settings.ageRange": "Age range",
  "settings.distance": "Maximum distance",
  "settings.showMe": "Show me in discovery",
  "settings.showMeDesc": "Temporarily hide your profile from new people.",
  "settings.notifications": "Notifications",
  "settings.notifMatches": "New matches",
  "settings.notifMessages": "New messages",
  "settings.notifLikes": "Likes",
  "settings.notifActivity": "Activity updates",
  "settings.appearance": "Appearance",
  "settings.theme": "Theme",
  "settings.themeSystem": "System",
  "settings.themeLight": "Light",
  "settings.themeDark": "Dark",
  "settings.language": "Language",
  "settings.privacy": "Privacy & Safety",
  "settings.blockedUsers": "Blocked users",
  "settings.blockedEmpty": "No blocked users",
  "settings.unblock": "Unblock",
  "settings.unblockedToast": "Unblocked",
  "settings.dataPrivacy": "Data & privacy",
  "settings.locationSettings": "Location",
  "settings.locationDesc":
    "VYBE only ever shows an approximate distance, never your exact location.",
  "settings.visibility": "Profile visibility",
  "settings.support": "Support",
  "settings.helpCenter": "Help center",
  "settings.reportProblem": "Report a problem",
  "settings.guidelines": "Community guidelines",
  "settings.problemTitle": "Report a problem",
  "settings.problemCategory": "Category",
  "settings.problemDesc": "Describe the issue",
  "settings.problemSubmit": "Submit",
  "settings.problemDone": "Thanks! Our team will get back to you.",
  "settings.exportData": "Export my data",
  "settings.exportHint": "Download a copy of your profile data (JSON).",
  "settings.dataNote":
    "Your data is used to show you better matches and keep VYBE safe. We never sell your data.",
  "settings.logOut": "Log out",
  "settings.logOutTitle": "Log out of VYBE?",
  "settings.logOutDesc": "You'll need your email to sign back in.",
  "settings.deletedToast": "Your account has been deleted.",
  "settings.savedToast": "Saved",
  "settings.preferencesSaved": "Preferences saved",

  // Blocked list
  "blocked.title": "Blocked users",
  "blocked.hint": "Blocked people can't see you or message you.",

  // Verification
  "verify.title": "Verify your profile",
  "verify.desc":
    "Upload a clear, recent photo of your face. Our team reviews it — usually within a few hours.",
  "verify.upload": "Upload a photo",
  "verify.submit": "Submit for review",
  "verify.photoRequired": "Please add a photo first.",
  "verify.pendingTitle": "Verification in review",
  "verify.pendingDesc":
    "You'll see a badge on your profile once it's approved. Usually takes a few hours.",
  "verify.error": "Couldn't upload. Please try again.",

  // Empty / error states
  "state.offline": "No connection",
  "state.offlineDesc": "Check your internet and try again.",
  "state.errorDesc": "We couldn't load this. Please try again.",

  // Safety
  "safety.reportCategories": "Report categories",
  "safety.cat_fake_profile": "Fake profile",
  "safety.cat_harassment": "Harassment",
  "safety.cat_inappropriate": "Inappropriate content",
  "safety.cat_spam": "Spam",
  "safety.cat_underage": "Underage user",
  "safety.cat_other": "Other",
  "safety.sos": "Something doesn't feel right?",
  "safety.sosHint": "You can block or report anyone, anytime.",
} as const;

const tr: Record<keyof typeof en, string> = {
  "app.name": "VYBE",
  "app.tagline": "Vibeyi hisset. İnsanlarını bul.",
  "nav.discover": "Keşfet",
  "nav.matches": "Eşleşmeler",
  "nav.messages": "Mesajlar",
  "nav.activity": "Aktivite",
  "nav.profile": "Profil",
  "common.loading": "Yükleniyor",
  "common.retry": "Tekrar dene",
  "common.cancel": "Vazgeç",
  "common.confirm": "Onayla",
  "common.save": "Kaydet",
  "common.back": "Geri",
  "common.close": "Kapat",
  "common.done": "Tamam",
  "common.skip": "Sonra",
  "common.continue": "Devam et",
  "common.next": "İleri",
  "common.error": "Bir şeyler ters gitti",
  "common.networkError": "Çevrimdışı görünüyorsun. Bağlantını kontrol et.",
  "common.oops": "Hata",
  "common.optional": "İsteğe bağlı",
  "common.none": "Yok",
  "common.kmAway": "{km} km uzakta",
  "common.miAway": "{km} mil uzakta",
  "common.inCity": "{city} şehrinde",
  "common.verified": "Doğrulanmış",
  "common.verificationPending": "Doğrulama bekliyor",
  "common.justNow": "şimdi",
  "common.minutesAgo": "{n}dk",
  "common.hoursAgo": "{n}sa",
  "common.daysAgo": "{n}g",
  "common.yesterday": "Dün",
  "common.loadMore": "Daha fazla yükle",
  "common.gotIt": "Anladım",
  "common.online": "Şu an çevrimiçi",
  "common.activeAgo": "{time} önce aktif",
  "common.lastActive": "Son aktif {time} önce",

  "landing.eyebrow": "Global sosyal keşif",
  "landing.headline": "Vibeyi bul.",
  "landing.subheadline":
    "İnsanları keşfet, sohbetleri başlat ve enerjisi sana uyanlarla bağlan.",
  "landing.cta": "Başla",
  "landing.openApp": "VYBE'yi aç",
  "landing.logIn": "Zaten hesabım var",
  "landing.feature1Title": "Gerçek bağlantılar",
  "landing.feature1Desc":
    "Sadece enerjini hisseden insanlarla eşleş. Gürültü yok, bot yok — sadece vibe.",
  "landing.feature2Title": "Dünyanın her yerinde",
  "landing.feature2Desc":
    "İstanbul'dan Tokyo'ya, şehrindeki veya dünyanın öbür ucundaki insanlarla tanış.",
  "landing.feature3Title": "Güvenli tasarım",
  "landing.feature3Desc":
    "İstediğini engelle, bildir ve seni kimin göreceğini kontrol et. Sadece yaklaşık konum.",
  "landing.statsUsers": "1M+ paylaşılan vibe",
  "landing.statsMatches": "Her 3 saniyede bir eşleşme",
  "landing.statsCountries": "120+ ülke",
  "landing.footer": "Dünya için ♥ ile yapıldı. Yalnızca 18+.",
  "landing.splashTagline": "Vibeyi hisset. İnsanlarını bul.",

  "auth.welcomeBack": "Tekrar hoş geldin",
  "auth.findYourVibe": "Vibeyi bul.",
  "auth.subtitle":
    "İnsanları keşfet, sohbetleri başlat ve enerjisi sana uyanlarla bağlan.",
  "auth.continueWithApple": "Apple ile devam et",
  "auth.continueWithGoogle": "Google ile devam et",
  "auth.continueWithEmail": "E-posta ile devam et",
  "auth.alreadyAccount": "Zaten hesabın var mı?",
  "auth.logIn": "Giriş yap",
  "auth.emailTitle": "E-postan",
  "auth.emailSubtitle": "Sana güvenli bir kod göndereceğiz. Şifre gerekmez.",
  "auth.emailPlaceholder": "sen@ornek.com",
  "auth.sendCode": "Kodu gönder",
  "auth.checkEmail": "E-postanı kontrol et",
  "auth.codeSent": "{email} adresine 6 haneli kod gönderdik",
  "auth.codePlaceholder": "Kodu gir",
  "auth.verify": "Doğrula ve devam et",
  "auth.verifyError": "Girdiğin kod hatalı. Tekrar dene.",
  "auth.resend": "Kod gelmedi mi?",
  "auth.tryAgain": "Tekrar dene",
  "auth.useDifferentEmail": "Farklı bir e-posta kullan",
  "auth.ageNote": "VYBE'yi kullanmak için en az 18 yaşında olmalısın.",
  "auth.termsNote": "Devam ederek Kullanım Şartları'nı kabul edersin.",
  "auth.providerUnavailable": "Yakında",
  "auth.providerUnavailableDesc":
    "{provider} girişi henüz açık değil. E-postanla hızlıca devam et — saniyeler sürer.",
  "auth.oAuthNote": "Google ve Apple girişi, anahtarlar eklendiğinde aktif olur",

  "onboard.title": "Profilini oluştur",
  "onboard.subtitle": "Birkaç hızlı adım, sonra içeridesin.",
  "onboard.step": "Adım {current} / {total}",
  "onboard.nameTitle": "Adın ne?",
  "onboard.nameSubtitle": "İnsanlar seni VYBE'de böyle görecek.",
  "onboard.namePlaceholder": "İlk adın",
  "onboard.nameError": "Lütfen ilk adını gir.",
  "onboard.birthTitle": "Doğum günün ne zaman?",
  "onboard.birthSubtitle": "Yaşın profilinde görünür. 18+ olmalısın.",
  "onboard.ageError": "En az 18 yaşında olmalısın.",
  "onboard.birthError": "Lütfen geçerli bir doğum tarihi gir.",
  "onboard.genderTitle": "Cinsiyetin nedir?",
  "onboard.genderSubtitle": "Bunu istediğin zaman değiştirebilirsin.",
  "onboard.interestedTitle": "Kimlerle ilgileniyorsun?",
  "onboard.interestedSubtitle":
    "Bir veya daha fazla seçebilirsin. Sonra değiştirebilirsin.",
  "onboard.locationTitle": "Neredesin?",
  "onboard.locationSubtitle":
    "Daha iyi eşleşmeler için konumunu aç. Sadece yaklaşık mesafe paylaşırız.",
  "onboard.allowLocation": "Konumuma izin ver",
  "onboard.locationDenied": "Sorun değil — bunun yerine şehir seç.",
  "onboard.cityPlaceholder": "Şehrini seç",
  "onboard.photosTitle": "Fotoğraflarını ekle",
  "onboard.photosSubtitle": "İnsanlar vibeni görebilsin diye en az bir fotoğraf ekle.",
  "onboard.photosHint": "Fotoğraflar yalnızca paylaşmaya hazır olduğunda görünür.",
  "onboard.bioTitle": "Bize kendinden bahset",
  "onboard.bioSubtitle": "Kısa bir bio, enerjini hissettirmeye yardımcı olur.",
  "onboard.bioPlaceholder":
    "Viben ne? Kahve buluşmaları, doğa yürüyüşleri, gece sohbetleri…",
  "onboard.bioHint": "{count} karakter kaldı",
  "onboard.interestsTitle": "İlgi alanlarını seç",
  "onboard.interestsSubtitle":
    "Sevdiğin birkaç şeyi seç. Sadece görünüşe değil, vibe'a göre eşleş.",
  "onboard.languagesTitle": "Konuştuğun diller",
  "onboard.verifyTitle": "Profilini doğrula",
  "onboard.verifySubtitle":
    "İsteğe bağlı. Doğrulanmış profiller daha çok eşleşme ve rozet alır.",
  "onboard.verifyLater": "Belki sonra",
  "onboard.verifyNow": "Şimdi doğrula",
  "onboard.verifyDesc": "Kendine ait net bir fotoğraf yükle.",
  "onboard.verifySubmitted":
    "Doğrulaman inceleniyor. Onaylanınca rozet alacaksın.",
  "onboard.doneTitle": "Hazırsın!",
  "onboard.doneSubtitle": "VYBE'ye hoş geldin. Vibeyi hisset.",
  "onboard.startDiscovering": "Keşfetmeye başla",
  "onboard.uploading": "Yükleniyor…",

  "gender.woman": "Kadın",
  "gender.man": "Erkek",
  "gender.nonbinary": "Non-binary",
  "gender.other": "Diğer",

  "discover.title": "Keşfet",
  "discover.emptyTitle": "Hepsini gördün",
  "discover.emptyHint":
    "Yakınındaki herkesi gördün. Birazdan tekrar bak — her gün yeni vibeler gelir.",
  "discover.refresh": "Yenile",
  "discover.pass": "Geç",
  "discover.like": "Beğen",
  "discover.superVybe": "Süper VYBE",
  "discover.tapHint": "Tam profili görmek için karta dokun",
  "discover.matched": "Eşleştiniz!",
  "discover.matchedHint":
    "Sen ve {name} birbirinizi beğendiniz. Vibe sönmeden merhaba de.",
  "discover.likeLimit": "Bugünlük beğeni hakkın doldu. Yarın tekrar gel!",
  "discover.swipeHint": "Beğenmek için sağa, geçmek için sola, Süper VYBE için yukarı kaydır",

  "profile.about": "Hakkında",
  "profile.interests": "İlgi alanları",
  "profile.lifestyle": "Yaşam tarzı",
  "profile.languages": "Diller",
  "profile.prompts": "Sorular",
  "profile.shared": "Seninle ortak",
  "profile.distance": "{distance} uzakta",
  "profile.report": "Bildir",
  "profile.block": "Engelle",
  "profile.blockTitle": "{name} engellensin mi?",
  "profile.blockDesc":
    "Sen onu göremezsin, o seni göremez ve sohbetiniz kapanır. Daha sonra engeli kaldırabilirsin.",
  "profile.reportTitle": "{name} bildirilsin mi?",
  "profile.reportDesc": "Bildirimler anonimdir. Ekibimiz her bildirimi inceler.",
  "profile.reportCategory": "Neden",
  "profile.reportPlaceholder": "Detay ekle (isteğe bağlı)",
  "profile.reportSubmit": "Bildirimi gönder",
  "profile.reportDone": "Teşekkürler. Ekibimiz bu bildirimi inceleyecek.",
  "profile.blockedToast": "Engellendi. Artık birbirinizi görmeyeceksiniz.",
  "profile.reportedToast": "Bildirim gönderildi. VYBE'yi güvende tuttuğun için teşekkürler.",
  "profile.hidePhotos": "Fotoğraflar",

  "match.youCaught": "Aynı vibeyi yakaladınız",
  "match.subtitle": "Sen ve {name} birbirinizi beğendiniz. Değerlendirin.",
  "match.sendMessage": "Mesaj gönder",
  "match.keepDiscovering": "Keşfetmeye devam et",
  "match.newMatch": "Yeni eşleşme",

  "matches.title": "Eşleşmeler",
  "matches.new": "Yeni Eşleşmeler",
  "matches.recent": "Son Bağlantılar",
  "matches.emptyTitle": "Henüz eşleşme yok",
  "matches.emptyHint":
    "Kaydırmaya devam et — iki kişi aynı vibeyi yakalayınca burada görünür.",
  "matches.goDiscover": "Keşfetmeye başla",
  "matches.sayHi": "Merhaba de",
  "matches.unmatched": "Eşleşme kaldırıldı",
  "matches.chatClosed": "Sohbet kapatıldı",

  "messages.title": "Mesajlar",
  "messages.emptyTitle": "Henüz mesaj yok",
  "messages.emptyHint": "Sohbetlerin burada olacak. Önce eşleş!",
  "messages.typing": "yazıyor…",
  "messages.placeholder": "Mesaj…",
  "messages.send": "Gönder",
  "messages.delivered": "İletildi",
  "messages.read": "Okundu",
  "messages.unmatch": "Eşleşmeyi kaldır",
  "messages.unmatchTitle": "{name} ile eşleşme kaldırılsın mı?",
  "messages.unmatchDesc":
    "Sohbet ikiniz için de kapanır. Keşfet'te tekrar görünebilirler.",
  "messages.report": "Bildir",
  "messages.block": "Engelle",
  "messages.closed": "Bu sohbet kapatıldı.",
  "messages.you": "Sen",
  "messages.photo": "Fotoğraf",
  "messages.attach": "Fotoğraf ekle",
  "messages.sending": "Gönderiliyor…",
  "messages.loadEarlier": "Önceki mesajları yükle",

  "activity.title": "Aktivite",
  "activity.today": "Bugün",
  "activity.thisWeek": "Bu Hafta",
  "activity.earlier": "Daha Önce",
  "activity.emptyTitle": "Henüz aktivite yok",
  "activity.emptyHint": "Beğeniler, eşleşmeler ve mesajlar burada görünür.",
  "activity.likedYou": "seni beğendi",
  "activity.superLikedYou": "sana Süper VYBE gönderdi ✨",
  "activity.likeBack": "Beğen",
  "activity.sayHi": "Merhaba de",
  "activity.viewed": "profilini gördü",
  "activity.matchPrefix": "ile aynı vibeyi yakaladın",

  "profile.edit": "Profili düzenle",
  "profile.settings": "Ayarlar",
  "profile.completion": "Profil %{pct} tamamlandı",
  "profile.completionHint": "Daha çok eşleşme için profilini tamamla.",
  "profile.verify": "Doğrulan",
  "profile.verifyPending": "Doğrulama inceleniyor",
  "profile.verifyDesc": "Doğrulanmış profiller rozet alır ve 2 kat daha çok eşleşir.",
  "profile.myPhotos": "Fotoğraflarım",
  "profile.addPhoto": "Fotoğraf ekle",
  "profile.removePhoto": "Kaldır",
  "profile.reorderHint": "Sıralamak için sürükle — ilk fotoğraf ana fotoğrafındır.",
  "profile.bio": "Bio",
  "profile.bioEmpty": "Vibeni göstermek için kısa bir bio ekle.",
  "profile.interestsEmpty": "Enerjinle uyuşan insanlar bulmak için ilgi alanı ekle.",
  "profile.promptsEdit": "Düzenle",
  "profile.promptsEmpty": "Sohbet başlatmak için bir soru ekle.",
  "profile.saveError": "Kaydedilemedi. Lütfen tekrar dene.",
  "profile.savedToast": "Kaydedildi!",
  "profile.location": "Konum",
  "profile.lifestyleEdit": "Yaşam tarzı",

  "edit.title": "Profili düzenle",
  "edit.photosTitle": "Fotoğraflar",
  "edit.bioTitle": "Bio",
  "edit.interestsTitle": "İlgi alanları",
  "edit.languagesTitle": "Diller",
  "edit.promptsTitle": "Sorular",
  "edit.promptQuestion": "Soru",
  "edit.promptAnswer": "Cevap",
  "edit.addPrompt": "Soru ekle",
  "edit.removePrompt": "Kaldır",
  "edit.save": "Değişiklikleri kaydet",

  "settings.title": "Ayarlar",
  "settings.account": "Hesap",
  "settings.email": "E-posta",
  "settings.changePassword": "Şifre değiştir",
  "settings.passwordNote":
    "VYBE şifre yerine güvenli tek kullanımlık kodlar kullanır. Giriş yapmak için e-postanı kullan.",
  "settings.signOutDevice": "Bu cihazdan çıkış yap",
  "settings.deleteAccount": "Hesabı sil",
  "settings.deleteTitle": "Hesabın silinsin mi?",
  "settings.deleteDesc":
    "Profilin, eşleşmelerin ve mesajların kalıcı olarak silinir. Bu işlem geri alınamaz.",
  "settings.deleteConfirm": "Kalıcı olarak sil",
  "settings.discovery": "Keşif Tercihleri",
  "settings.ageRange": "Yaş aralığı",
  "settings.distance": "Maksimum mesafe",
  "settings.showMe": "Keşifte görün",
  "settings.showMeDesc": "Profilini yeni insanlardan geçici olarak gizle.",
  "settings.notifications": "Bildirimler",
  "settings.notifMatches": "Yeni eşleşmeler",
  "settings.notifMessages": "Yeni mesajlar",
  "settings.notifLikes": "Beğeniler",
  "settings.notifActivity": "Aktivite güncellemeleri",
  "settings.appearance": "Görünüm",
  "settings.theme": "Tema",
  "settings.themeSystem": "Sistem",
  "settings.themeLight": "Açık",
  "settings.themeDark": "Koyu",
  "settings.language": "Dil",
  "settings.privacy": "Gizlilik & Güvenlik",
  "settings.blockedUsers": "Engellenen kullanıcılar",
  "settings.blockedEmpty": "Engellenen kullanıcı yok",
  "settings.unblock": "Engeli kaldır",
  "settings.unblockedToast": "Engel kaldırıldı",
  "settings.dataPrivacy": "Veri ve gizlilik",
  "settings.locationSettings": "Konum",
  "settings.locationDesc":
    "VYBE yalnızca yaklaşık mesafe gösterir, asla tam konumunu paylaşmaz.",
  "settings.visibility": "Profil görünürlüğü",
  "settings.support": "Destek",
  "settings.helpCenter": "Yardım merkezi",
  "settings.reportProblem": "Sorun bildir",
  "settings.guidelines": "Topluluk kuralları",
  "settings.problemTitle": "Sorun bildir",
  "settings.problemCategory": "Kategori",
  "settings.problemDesc": "Sorunu açıkla",
  "settings.problemSubmit": "Gönder",
  "settings.problemDone": "Teşekkürler! Ekibimiz sana dönüş yapacak.",
  "settings.exportData": "Verilerimi dışa aktar",
  "settings.exportHint": "Profil verilerinin bir kopyasını indir (JSON).",
  "settings.dataNote":
    "Verilerin daha iyi eşleşmeler ve VYBE'yi güvende tutmak için kullanılır. Verilerini asla satmayız.",
  "settings.logOut": "Çıkış yap",
  "settings.logOutTitle": "VYBE'den çıkış yapılsın mı?",
  "settings.logOutDesc": "Tekrar giriş için e-postan gerekecek.",
  "settings.deletedToast": "Hesabın silindi.",
  "settings.savedToast": "Kaydedildi",
  "settings.preferencesSaved": "Tercihler kaydedildi",

  "blocked.title": "Engellenen kullanıcılar",
  "blocked.hint": "Engellenen kişiler seni göremez ve mesaj atamaz.",

  "verify.title": "Profilini doğrula",
  "verify.desc":
    "Yüzünün net ve güncel bir fotoğrafını yükle. Ekibimiz inceler — genelde birkaç saat içinde.",
  "verify.upload": "Fotoğraf yükle",
  "verify.submit": "İncelemeye gönder",
  "verify.photoRequired": "Önce bir fotoğraf ekle.",
  "verify.pendingTitle": "Doğrulama inceleniyor",
  "verify.pendingDesc":
    "Onaylanınca profilinde bir rozet göreceksin. Genelde birkaç saat sürer.",
  "verify.error": "Yüklenemedi. Lütfen tekrar dene.",

  "state.offline": "Bağlantı yok",
  "state.offlineDesc": "İnternetini kontrol et ve tekrar dene.",
  "state.errorDesc": "Bunu yükleyemedik. Lütfen tekrar dene.",

  "safety.reportCategories": "Bildirim kategorileri",
  "safety.cat_fake_profile": "Sahte profil",
  "safety.cat_harassment": "Taciz",
  "safety.cat_inappropriate": "Uygunsuz içerik",
  "safety.cat_spam": "Spam",
  "safety.cat_underage": "Reşit olmayan kullanıcı",
  "safety.cat_other": "Diğer",
  "safety.sos": "Bir şeyler ters mi?",
  "safety.sosHint": "İstediğin kişiyi engelleyebilir veya bildirebilirsin.",
};

export type TKey = keyof typeof en;

type Dict = Record<string, string>;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TKey, params?: Record<string, string | number>) => string;
  formatRelativeTime: (ms: number) => string;
  formatClockTime: (ms: number) => string;
  formatFullDate: (ms: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "vybe-lang";

function interpolate(
  template: string | undefined,
  params?: Record<string, string | number>,
) {
  if (!template) return "";
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`,
  );
}

function pickLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "tr") return stored;
  } catch {
    /* ignore */
  }
  return "en";
}

const enDict = en as Dict;
const trDict = tr as Dict;

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(pickLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const dict: Dict = lang === "tr" ? trDict : enDict;

  const t = useCallback(
    (key: TKey, params?: Record<string, string | number>) =>
      interpolate(dict[key] ?? enDict[key] ?? key, params),
    [dict],
  );

  const formatRelativeTime = useCallback(
    (ms: number) => {
      const diff = Date.now() - ms;
      const min = 60 * 1000;
      const hour = 60 * min;
      const day = 24 * hour;
      if (diff < min) return t("common.justNow");
      if (diff < hour) return t("common.minutesAgo", { n: Math.floor(diff / min) });
      if (diff < day) return t("common.hoursAgo", { n: Math.floor(diff / hour) });
      if (diff < 7 * day) return t("common.daysAgo", { n: Math.floor(diff / day) });
      if (diff < 2 * day) return t("common.yesterday");
      return formatFullDate(ms);
    },
    [t],
  );

  const formatClockTime = useCallback(
    (ms: number) => {
      const d = new Date(ms);
      return d.toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    [lang],
  );

  const formatFullDate = useCallback(
    (ms: number) => {
      const d = new Date(ms);
      return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
        day: "numeric",
        month: "short",
      });
    },
    [lang],
  );

  const setLang = useCallback((next: Lang) => setLangState(next), []);

  const value = useMemo(
    () => ({ lang, setLang, t, formatRelativeTime, formatClockTime, formatFullDate }),
    [lang, setLang, t, formatRelativeTime, formatClockTime, formatFullDate],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export const LANGUAGE_NAMES: Record<Lang, string> = {
  en: "English",
  tr: "Türkçe",
};

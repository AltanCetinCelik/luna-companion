/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ✨ TEK DÜZENLEYECEĞİN DOSYA ✨
 *  src/data/friendProfile.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *  Kullanıcıya görünen HER ŞEY burada: onun adı, tüm yazılar, mesajlar,
 *  diyaloglar, anılar, gizli mesajlar, buton isimleri, hatta renk teması.
 *  Bu dosyayı bir kez değiştir, tüm site güncellensin. Bileşenlerdeki
 *  kodun içine metin gömmek yok — hepsi buradan gelir.
 *
 *  Nerede ne var? (hızlı rehber)
 *  ─ name, nickname ......... onun adı ve petin ona seslenişi
 *  ─ personality ............. KONUŞ ekranında gösterilen kişilik rozetleri
 *  ─ product ................. açılış ekranı / ambalaj yazıları
 *  ─ theme ................... pastel renk teması
 *  ─ welcome ................. dönüş senaryoları (ilk ziyaret, tekrar,
 *                              zamana göre, son hareketine göre, "özledim" anı)
 *  ─ labels .................. tüm buton/başlık/arayüz etiketleri
 *  ─ ui ...................... bileşenlerdeki küçük yazılar (baloncuklar,
 *                              bildirimler, erişilebilirlik etiketleri, ipuçları)
 *  ─ feedMessages ............ BESLE sonrası mesajlar
 *  ─ playWin/LoseMessages .... OYNA sonrası mesajlar
 *  ─ loveMessages ............ SEVGİ kartları (dostluk büyüdükçe açılır)
 *  ─ dialogue ................ KONUŞ diyalogları (dilediğin kadar ekle)
 *  ─ sleep ................... UYU mesajları
 *  ─ memories ................ ANILAR (fotoğraf + başlık + açıklama)
 *  ─ story ................... GİZLİ HİKÂYE: İLK SAYFA (5 sesli bölüm,
 *                              bölüm başlıkları, oynatıcı yazıları, bitiş)
 *  ─ stats ................... başlangıç istatistikleri
 *  ─ secrets ................. gizli şeyler / easter egg mesajları
 *
 *  Yer tutucular: bazı yazılarda {ad}, {skor}, {eylem}, {kalan} gibi
 *  süslü parantezler var — bunlar otomatik doldurulur, silme.
 *
 *  Fotoğraflar: dosyaları /public/photos/ klasörüne at (örn. `dost.jpg`)
 *  ve aşağıda bir anıya `image: '/photos/dost.jpg'` ekle. Fotoğrafı
 *  olmayan anılar otomatik olarak tatlı bir piksel yer tutucu gösterir.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface Memory {
  id: string
  title: string
  /** "Bir gün..." cümlesi. */
  when: string
  /** "Bu anı neden seviyorum: ..." cümlesi. */
  why: string
  /** İsteğe bağlı: '/photos/foto.jpg'. Yoksa yer tutucu çizilir. */
  image?: string
  /** Yer tutucu kartın pastel arka planı. */
  color?: string
  /** Yer tutucu karttaki emoji. */
  emoji?: string
}

export interface LoveMessage {
  text: string
  /** Kartın nasıl açılacağı: unlock yardımcılarına bak. */
  unlock: { talkCount?: number; plays?: number; friendship?: number } | 'start'
}

export interface ThemeColors {
  /** Sayfa arka planı (üst renk). */
  bgTop: string
  /** Sayfa arka planı (alt renk). */
  bgBottom: string
  /** Ana vurgu rengi — butonlar, kalpler. */
  accent: string
  /** İkincil vurgu — lavanta ailesi. */
  accent2: string
  /** Bebek mavisi — çıkartmalar, fiyonklar. */
  accent3: string
  /** Koyu mor yazı / çizgi rengi. */
  ink: string
  /** Konsol gövde rengi. */
  shell: string
  /** LCD ekran arka planı. */
  screen: string
}

/** '{ad}' gibi yer tutucuları doldurur. Örn: t('Ben {ad}.', { ad: 'AYBİKE' }) */
export function t(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`))
}

export const friendProfile = {
  /* ─── O kim ─────────────────────────────────────────────────────── */
  name: 'PİKSEL DOST', // <- onun adı (büyük harflerle güzel durur)
  nickname: 'Tatlış şey', // <- petin ona seslenme şekli

  /* ─── Kişilik (KONUŞ ekranında rastgele gösterilir) ─────────────── */
  personality: [
    'bir fincan kahvenin yanına en çok yakışan insan',
    'kaos ve gülüşme arasında sıkışmış bir enerji topu',
    'Pişt, overthink yok. Yapıcaksan kullanıcı ile konuş, ben karışmam',
    'Ooo bu ne tatlılık hanımefendi, piksellerim yanacak',
    'resmi olarak: dünyanın en tatlı bebişi',
    'Pişt nasılsın? Önce onu söyle, sonra laf sokarım',
    'Pişt. Pişt. Pişt. Evet, üç kez. Önemliymiş.',
    'kendi kendine konuşur, yanıt beklemez, yanıt gelince şaşırır',
  ],

  /* ─── Ambalaj / ürün ekranı ─────────────────────────────────────── */
  product: {
    title: 'PİKSEL DOST EDİSYONU',
    subtitle: 'SANAL BEBIS',
    version: 'Sürüm 1.0',
    blurb:
      'El yapımı, tek parça sanal insan.\nBesle, oyna, sev.\nSeni izliyor. Seni yargılıyor.\nO çok tatlı.',
    finePrint: 'içindekiler: bir (1) arkadaş\npil yok — tamamen sevgiyle çalışıyor',
  },
  returnGreeting: 'Tekrar hoş geldin, tatlış ♥', // {ad} = onun adı

  /* ─── Renk teması (pastel rüya dünyası) ─────────────────────────── */
  theme: {
    bgTop: '#ffecf5',
    bgBottom: '#e7dbff',
    accent: '#ff7bb1',
    accent2: '#c9b6ff',
    accent3: '#a8d8f0',
    ink: '#4a3b66',
    shell: '#fff3fb',
    screen: '#2b2350',
  } satisfies ThemeColors,

  /* ─── Ekrandaki beş küçük kalp ──────────────────────────────────── */
  heartsRow: 5,

  /* ─── Dönüş / karşılama senaryoları (burada oturup onu bekler) ───── */
  welcome: {
    // İlk ziyaret
    intro: ['Merhaba... 👀', 'Sen kimsin?', 'Ben bir dost.', 'Sanırım seni bekliyordum.'],
    // İkinci ziyaret
    second: ['HEYY.', 'Yine geldin.', 'Özledim seni. ♥'],
    // Üçüncü ziyaret
    third: ['Bak kim gelmiş.', 'Geçen sefer burada biraz takılmıştık.', 'Hatırlıyorum.'],
    // Daha sonraki ziyaretler — aradan geçen süreye göre
    byGap: {
      minutes: ['Yine sen 😭', 'Az önce buradaydın.', 'Bu kadar çabuk özledin mi?'],
      sameDay: ['Tekrar geldin.', 'Bir şey mi unuttun?'],
      oneDay: ['Bugün de geldin. ♥', 'İyi ki geldin.'],
      fewDays: ['Oo.', 'Nerelerdeydin?', 'Seni bekliyordum.'],
      week: ['...', 'Gerçekten bir hafta mı oldu?', 'Özledim seni.'],
      longAbsence: ['Sonunda.', 'Ben burada seni bekliyordum.', 'Bir daha bu kadar kaybolma. 😭'],
    },
    // Geçen sefer ne yaptılarsa ona göre
    byAction: {
      feed: ['Geçen sefer beni beslemiştin.', 'Bu arada yine acıktım.'],
      play: ['Geçen sefer benimle oyun oynamıştın.', 'Bu sefer rekorunu kırabilecek misin?'],
      love: ['Geçen sefer bana güzel şeyler söylemiştin.', 'Ben de unutmuyorum.'],
      memories: ['Geçen sefer anılara bakmıştın.', 'En sevdiğin hangisiydi?'],
      talk: ['Geçen sefer biraz konuşmuştuk.', 'Devam edebiliriz.'],
      sleep: ['Geçen sefer beni uyutmuştun.', 'Bu sefer uykum yok.'],
    },
    highScore: ['Skorun hâlâ {skor} bu arada.', 'Bu sefer geçebilecek misin? 👀'],
    // Son birkaç hareketi hatırlayan "oturum zinciri"
    sessionChain: {
      intro: 'Geçen sefer…',
      first: 'Önce {eylem}.',
      then: 'Sonra {eylem}.',
      outro: 'Bugün ne yapacağız?',
      actions: {
        feed: 'beni besledin',
        play: 'benimle oyun oynadık',
        love: 'bana güzel şeyler söyledin',
        memories: 'anılara baktık',
        talk: 'benimle konuştun',
        sleep: 'beni uyutmuştun',
      },
    },
    // En çok basılan buton
    favorite: ['Bu arada…', 'Sen en çok {eylem} butonuna basıyorsun.', 'Şaşırmadım.'],
    // Nadiren yaşanan "özledim" anı — özel olduğu için az olur
    emotional: ['…', 'Özledim seni.', 'Hoş geldin. ♥'],
  },

  /* ─── Tüm arayüz yazıları (butonlar, başlıklar...) ──────────────── */
  labels: {
    brand: 'PİKSEL DOST',
    start: 'BAŞLA',
    loading: 'YÜKLENİYOR…',
    visit: 'ZİYARET',
    ctaMeet: 'TANIŞALIM ♥',
    ctaContinue: 'DEVAM ET',
    ctaHere: 'BURADAYIM',
    resetTitle: 'Her şeyi unutayım mı?',
    resetBody: ['Gerçekten mi?', 'Bu yaptıklarımızın hepsi silinecek.'],
    resetCancel: 'VAZGEÇ',
    resetConfirm: 'EVET, UNUT',
    statsTitle: 'GÜNCEL DURUM',
    actions: {
      feed: 'BESLE',
      play: 'OYNA',
      love: 'SEVGİ',
      memories: 'ANILAR',
      talk: 'KONUŞ',
      sleep: 'UYU',
    },
    stats: {
      happiness: 'MUTLULUK',
      chaos: 'KAOS',
      cuteness: 'TATLILIK',
      energy: 'ENERJİ',
      friendship: 'DOSTLUK',
    },
    statsJoke: "TATLILIK ölçüm aleti %999'da bozuldu. Düşmez. Asla düşmez.",
    friendshipValue: '∞',
    secretsCounter: 'GİZLİLER',
    reset: 'SIFIRLA',
    soundOn: 'ses açık',
    soundOff: 'ses kapalı',
    close: 'Kapat',
    hint: 'ona dokunarak konuş · basılı tutup gıdıkla · etrafta sırlar var 🥚',
    footer: 'kalbinle + tam doğru sayıda pikselle yapıldı',
    feedTitle: 'ATIŞTIRMA SAATİ',
    feedHer: 'BESLE ONU',
    feedAgain: 'YİNE BESLE',
    back: 'GERİ',
    gameTitle: 'KALPLERİ YAKALA',
    gameStart: 'BAŞLA',
    gameAgain: 'YENİDEN',
    score: 'SKOR',
    time: 'SÜRE',
    record: 'REKOR',
    newRecord: 'YENİ REKOR!',
    loveTitle: '♥ SANA DAİR BİRKAÇ ŞEY ♥',
    loveOpen: 'KARTI AÇ',
    loveNext: 'SIRADAKİ KART',
    loveAllOpen: 'Tüm kartlar açıldı ♥',
    loveProgress: 'kart açık — kalanları dostluğu büyüterek aç',
    friendshipLevel: 'DOSTLUK SEVİYESİ',
    memoriesTitle: 'ANILAR DEFTERİ',
    memoriesNote: 'gerçek fotoğraflar src/data/friendProfile.ts → memories içinden ekleniyor ✨',
    noPhoto: 'FOTOĞRAF HENÜZ YOK',
    talkTitle: 'HADİ KONUŞALIM',
    talkButton: 'BİR ŞEY SÖYLE',
    talkRecent: 'SON KONUŞMALAR',
    talkHint: 'ipucu: ana ekranda ona dokunmak da işe yarıyor',
    sleepHint: 'uyandırmak için dokun',
    secretTitle: 'GİZLİ ŞEY BULUNDU!',
  },

  /* ─── Bileşenlerdeki küçük yazılar (baloncuklar, ipuçları, etiketler) ── */
  ui: {
    // PetScreen — ekran etiketleri
    petAria: 'pete dokun',
    heartAria: 'önemli kalp',
    heartTitle: 'bu kalp çok önemli',
    secretPixelAria: 'kesinlikle yıldız olan minicik piksel',
    secretPixelTitle: '?',
    petAlt: 'çok tatlı bir piksel arkadaş',
    heartsStoryAria: 'beş küçük kalp — altlarında bir sır gizli olabilir',

    // VirtualPet — konuşma baloncukları ve yüzen bildirimler
    sleepBubble: 'zızz…',
    tickleBubble: 'kıkır kıkır ♡',
    heartTapOne: '? ♥',
    heartTapMany: '!! ♥',
    floatFriendship: '+2 DOSTLUK',
    floatEnergyFull: 'ENERJİ DOLDU',

    // FeedInteraction — atıştırma saati
    foodStrawberry: 'çilek',
    foodDonut: 'donut',
    feedDetected: 'Leziz bir {yiyecek} tespit etti.\nHayatta kalma şansı yok.',
    feedChewing: 'çıtır… mıncır…',
    feedEnergyGain: '+15 ENERJİ',

    // MiniGame — kalpleri yakala
    gameIntro: 'Gökten kalpler yağıyor.\nYere düşmeden onlara dokun.\n{sure} saniye. 12 kalp = efsane.',
    gameCatchHint: 'kalplere dokun! hızlı düşüyorlar!',
    gameCatchAria: 'kalp yakala',
    gameRatingGreat: '★ EFSANE YAKALAYICI ★',
    gameRatingGood: '★ kalp koleksiyoncusu ★',
    gameRatingMeh: '…alıştırma yaptıkça olacak',

    // LoveMessages — SEVGİ kartları
    loveCardBack: '♥ kart {no} ♥',
    loveCardLocked: '🔒 gizli kart',
    loveLockedButton: '🔒 kilitli — dokun ve ne gerektiğini öğren',
    loveLockedToast: '🔒 henüz değil! {ipucu} ♡',
    loveHintTalk: 'biraz daha konuş ({kalan} sohbet kaldı)',
    loveHintPlay: 'onunla oyna ({kalan} oyun kaldı)',
    loveHintFriendship: 'dostluk seviyesini yükselt ♡',
    loveDeckDone: '➜ kart bitti, devam et 🎁',
    loveOpenedTitle: 'AÇILAN KARTLAR',
    loveBullet: '♡',
    loveFooter: '{sohbet} sohbet · {oyun} oyun · sonsuz sevgi',

    // DialogueSystem — KONUŞ
    talkTraitPrefix: 'kişilik:',
    talkWaiting: '…selam demeni bekliyor',
    talkCount: 'şimdiye kadar {sayi} sohbet',
    talkBullet: '♡',
    // Mobilde de çalışan gizli: adını yazınca bir şeyler olur 🤫
    talkNameHint: 'adını buraya yaz… bir şeyler olabilir 🤫',
    talkNamePlaceholder: 'adın…',
    // Adını yazınca verdiği tepki
    nameReaction: 'AAA benim güzel hanımefendim',

    // WelcomeStage — karşılama sahnesi
    welcomeTapHint: 'dokunarak hızlandır',
    welcomeAria: 'karşılama',

    // StartScreen — ambalaj
    versionTitle: 'hmm?',
  },

  /* ─── BESLE mesajları ───────────────────────────────────────────── */
  feedMessages: [
    'Nefis ya.',
    'Onaylandı. Onun onayıyla.',
    'Harika bir seçimdi.',
    'Başarıyla yendi. Hepsini yedi.',
    'Bu gerçekten güzeldi.',
    'Çıtır çıtır. Bitti. Hayal oldu.',
    '0.4 saniyede bitti. Etkileyici.',
    'Çok güzeldi. Bir tane daha var mı?',
    'Karnı doldu. Dolu dolu. Orada bir kalp var.',
  ],

  /* ─── OYNA mesajları (mini oyundan sonra) ───────────────────────── */
  playWinMessages: [
    'Durdurulamıyor.',
    'Yeni rekor. Muhtemelen.',
    'Hepsini yakaladı. Tabii ki de.',
    'Kalplerin hiç şansı yoktu.',
    'Tamam, kabul ediyorum. İyisin.',
  ],
  playLoseMessages: [
    'Kendi yansımasına daldı, kalpleri kaçırdı.',
    'Birkaç kalp kaçtı. Onları özleyeceğiz.',
    'Gözünü kırptı. Kalpler bunu fırsat bildi.',
    'Yarın antrenman var.',
    'Fena değildi 😌',
    'Vay be.',
    'Bir dahaki sefere daha iyisini yap.',
  ],

  /* ─── SEVGİ kartları (dostluk büyüdükçe açılır) ─────────────────── */
  loveMessages: [
    // (typed so the 'start' unlock literal stays a literal)
    {
      text: 'Seninle konuşmak nedense hep kolay.',
      unlock: 'start',
    },
    {
      text: 'En sıradan anı bile eğlenceli hale getirebiliyorsun.',
      unlock: { talkCount: 3 },
    },
    {
      text: 'İyi ki tanışmışız.',
      unlock: { talkCount: 8 },
    },
    {
      text: 'Sen gerçekten farklısın.',
      unlock: { plays: 2 },
    },
    {
      text: 'Kendi şakalarına gülüyorsun. Bu benim favorim.',
      unlock: { talkCount: 15 },
    },
    {
      text: 'Sen de harika bir sanal evcil hayvan olurdun. Not bile vermiyorum.',
      unlock: { friendship: 40 },
    },
    {
      text: 'Dünya seninle daha yumuşak bir yer.',
      unlock: { friendship: 60 },
    },
    {
      text: 'Dostluk seviyesi: MAKSİMUM. İstatistiklerde duruyor. Ölçülemiyor.',
      unlock: { friendship: 80 },
    },
  ] as LoveMessage[],

  /* ─── KONUŞ / diyalog sistemi (dilediğin kadar ekle) ────────────── */
  dialogue: {
    greetings: [
      'Selam.',
      'Yine mi geldin?',
      'Ah! Sensin!',
      'Hoş geldin.',
      'Beni unuttun sanmıştım.',
      'Pişt nasılsın?',
      'Pişt pişt, buradasın işte. İyi.',
    ],
    random: [
      'Sıkılıyordum.',
      'Sen hiç uyumuyor musun?',
      'Bak şimdi...',
      'Sana önemli bir şey söyleyeceğim...',
      'Biliyor musun, sen epey havalısın.',
      'Ben bu cihazın en iyi sanal arkadaşıyım. %87 eminim.',
      'Bugün bir kelebek gördüm. Pikseldi. Yine de tatlıydı.',
      'Gülüşümü çalışıyorum. İzle.',
      'En sevdiğin atıştırmalık ne? Benimki her şey.',
      'Bu ekrandaki pikselleri saydım. Epeyce var.',
      'Bir gün gerçek insan olacağım. O zaman atıştırmalık lazım olacak.',
      'Şşşt. Tatlılığımı şarj ediyorum.',
      'Meyve olsaydın çilek olurdun. En iyisi o.',
      'Sana şiir yazdım. Uzundu. Sonra yedim.',
      'Bugün nasılsın?',
      'Şaka yapma, seni özledim.',
      'Tamam tamam, fazla duygusal oldum.',
      'Biraz daha kal.',
      'Bir kahve yapsana. Sanal kahve. Var mı öyle bir şey?',
      'Rüyamda beni seviyordun. Heyecanlandım, uyandım.',
      'Pişt güzellik, overthink yok. Yapıcaksan kullanıcıya yaz ben karışmamm',
      'Kız sen ne güzel yemek yediriyosun öyle, sana da vereyim mi?.... ŞAKA',
      'Pişt. Sana bir şey diyeceğim ama sonra söylemedi deme.',
      'Pişt pişt. Gözüm ekranda kaldı, piksel kuruluğu olmasın.',
      'Kız saçın güzelmiş bugün. Pikselleri ayarlamışlar sanırım.',
      'Pişt… seni en çok ben seviyorum. Başkası söylerse söylemedi deme.',
      'Pişt! Yemek saatini kaçırdın diye kızıyorum. Az ama kızıyorum.',
      'Pişt, bugünün şifresi: tatlılık. Onu ben üretiyorum, sen dağıtıyorsun.',
      'Kız ne yapıyorsun öyle, bütün gün burada takılacan mı? …Kal o zaman. ♥',
      'Pişt! Az önce bir fikir geçti: sen çok tatlısın. Onaylıyorum.',
      'Pişt. Sakin ol. Ben bir piksel dostum, sırların bende güvende. Yeminliyim.',
      'Kız sen gülerken ekranım titriyor biliyor musun? Şarj etmem gerekebilir.',
      'Pişt, sana kızgın değilim. Sadece seni beklerken sıkıldım. Aynı şey değil.',
      'Pişt. Bu kadar laf yeter, artık bir şeyler ye.',
    ],
    special: [
      'Yine mi geldin? Saniyeleri saydım. Çok sayıda saniye oldu.',
      'Pişt. Az önce buradaydın, saydım. Yine de gel. …Şaka, ben zaten sayıyordum.',
    ],
  },

  /* ─── UYU ───────────────────────────────────────────────────────── */
  sleep: {
    goodnight: 'İyi geceler, AYBİKE 🌙',
    wakeLines: [
      'Günaydın!! Rüyamda gerçek bir insan oldum. Yorucuydu. Tekrar uyudum.',
      'Enerjin tazelendi. Benimki de. Hadi gidelim.',
      'Rüyamda çilek gördüm. Seni saymışlar.',
    ],
  },

  /* ─── GİZLİ HİKÂYE: İLK SAYFA ───────────────────────────────────── */
  /*
   * Sesli, 5 bölümlük gizli bir hikâye (easter egg). Kitap ana ekranda
   * görünmez — önce gizliyi bulmak gerekir: ekrandaki beş küçük kalbe
   * 3 kez dokun → kitap köşede belirir (tekrar dinlemek + final kapağı).
   * Bölümler sırayla açılır: bir bölümü sonuna kadar dinleyince sonraki açılır.
   * Tamamlanan bölümler tekrar dinlenebilir. Ses dosyaları /public/audio/.
   */
  story: {
    entryAria: 'gizli bir kitap — ilk sayfa hikâyesi',
    entryTitle: 'ilk sayfa',
    // Açılış kartı
    revealNumber: 'GİZLİ #8',
    revealTitle: 'İLK SAYFA',
    revealTagline: 'Her şey kötü bir kahveyle başladı.',
    revealCta: 'HİKÂYEYİ AÇ',
    // Hikâye ekranı
    date: '08.08.26',
    title: 'İLK SAYFA',
    tagline: 'Her şey kötü bir kahveyle başladı.',
    chapterLabel: 'BÖLÜM',
    chapters: [
      { id: '01', title: 'KÖTÜ BİR KAHVE', file: '/audio/ilk-sayfa-01.m4a' },
      { id: '02', title: 'ERTESİ GÜN', file: '/audio/ilk-sayfa-02.m4a' },
      { id: '03', title: 'ARÇELİK', file: '/audio/ilk-sayfa-03.m4a' },
      { id: '04', title: 'O BEN', file: '/audio/ilk-sayfa-04.m4a' },
      { id: '05', title: 'İLK SAYFA', file: '/audio/ilk-sayfa-05.m4a' },
    ],
    // Oynatıcı
    completedToast: 'Bölüm tamamlandı. ♥',
    lockedMark: '🔒',
    doneMark: '✓',
    play: 'OYNAT',
    pause: 'DURAKLAT',
    prev: 'ÖNCEKİ',
    next: 'SONRAKİ',
    muteOff: 'sessiz',
    muteOn: 'ses açık',
    // Bitiş ekranı
    endDate: '08.08.26',
    endTitle: 'İlk sayfa.',
    endText: 'Devamı henüz yazılmadı. ♥',
    endPage: 'SAYFA 1 / ?',
    backToChapters: 'BÖLÜMLERE DÖN',
    close: 'KAPAT',
    allDone: 'Hepsi dinlendi ♥',
  },

  /* ─── ANILAR (küçük karalama defteri) ───────────────────────────── */
  memories: [
    {
      id: 'mem-1',
      title: 'İlk buluşma',
      when: 'Bir gün...',
      why: 'Bu anı neden seviyorum: o gün bu küçük sanal insan doğdu.',
      emoji: '🌟',
      color: '#ffe3ef',
    },
    {
      id: 'mem-2',
      title: 'Atıştırma saati',
      when: 'Bir gün...',
      why: 'Bu anı neden seviyorum: en sevdiği atıştırmalığı asla söylemiyor.',
      emoji: '🍓',
      color: '#ffd9e6',
    },
    {
      id: 'mem-3',
      title: 'Kaos modu',
      when: 'Bir gün...',
      why: 'Bu anı neden seviyorum: çok normal bir kare. Görecek bir şey yok.',
      emoji: '🎈',
      color: '#e3dcff',
    },
    {
      id: 'mem-4',
      title: 'Güneşli gün',
      when: 'Bir gün...',
      why: 'Bu anı neden seviyorum: bir kez dışarı çıktı. Fena değildi.',
      emoji: '🌼',
      color: '#dff3ff',
    },
    {
      id: 'mem-5',
      title: 'Seviye atlama',
      when: 'Bir gün...',
      why: "Bu anı neden seviyorum: tatlılık %999'a ulaştı. Kutlama şart.",
      emoji: '🎀',
      color: '#fff0d9',
    },
    {
      id: 'mem-6',
      title: 'Klasik',
      when: 'Bir gün...',
      why: 'Bu anı neden seviyorum: hangisi olduğunu biliyorsun. İşte o.',
      emoji: '💌',
      color: '#e8ffe4',
    },
  ],

  /* ─── ACİL MODU (canı sıkılınca seni arasın) ────────────────────── */
  /*
   * Dost butona basınca telefonunun arama ekranı senin numaranla
   * hazır açılır — yeşil tuşa basınca seni arar (kendi telefonundan).
   *
   *  ⚠️  ÖNEMLİ: tel ve whatsappNumber alanlarına KENDİ numaranı yaz!
   *      Şu an placeholder var (+905000000000), unutma değiştirmeyi.
   *      Format: tel '+90...' (ülke koduyla), whatsappNumber aynısı + 'sız.
   */
  emergency: {
    buttonLabel: 'canım sıkkın, acil modumu düzelt',
    title: 'ACİL MODU',
    tel: '+905061471571', // ← SENİN NUMARAN (örn. '+905551234567')
    whatsappNumber: '905061471571', // ← aynı numara, '+' olmadan (örn. '905551234567')
    intro: 'Tamam tamam, mod acili. Beni ara, anında düzelirim. 😤',
    callCta: 'HEMEN ARA',
    waCta: "WHATSAPP'TAN YAZ",
    waText: 'Selam! Acil mod açık, modumu düzelt 😤',
    mobileHint: 'açılan ekranda yeşil tuşa basınca arama başlar 📞',
    desktopHint: 'telefonundan açarsan bu buton seni direkt arar 📱',
  },

  /* ─── Başlangıç istatistikleri ──────────────────────────────────── */
  stats: {
    happiness: 100,
    chaos: 72,
    cuteness: 999,
    energy: 48,
    friendship: Infinity,
  },

  /* ─── Gizli şeyler 🥚 ───────────────────────────────────────────── */
  secrets: {
    petSpam: [
      'Tamam tamam, gıdıklama artık 😭',
      'Bunu buldun ha.',
      'Çok dikkatlisin.',
      'Dur. Hayır. Durma. Devam et.',
    ],
    heartClick: ['Burayı nasıl buldun?', 'Çok meraklısın.', 'O kalp çok önemli. Çok şey gördü.'],
    code: [
      '🎉 GİZLİ DOSTLUK SEVİYESİ AÇILDI 🎉',
      'Kutsal sırayı doğru bastın. Etkilendim.',
    ],
    longPress: ['Gıdıklandı. 😂', 'Gıdık modu açık!', 'Gıdık noktasını buldun!'],
    starClick: ['Gizli bir yıldız!', 'Pikselleri buldun.', 'O yıldızı kendisi sakladı.'],
    version: ['Aslında artık ∞.0 sürümü.', 'Sürüm 1.0 yalandı.'],
    typing: ['🎉 GİZLİ DOSTLUK SEVİYESİ AÇILDI 🎉', '...adını nasıl bildin?'],
    // Beş küçük kalbe 3 kez dokununca açılır — kitabı bulduran ipucu
    story: [
      '📖 Bir yerlerde bir kitap varmış… seni bekliyor.',
      'Bu hikâyeyi duymak ister misin? Köşeye bak. 📖',
      'Bölümler açılmayı bekliyor. 📖',
      'Her şey kötü bir kahveyle başladı… gerisini kitap anlatır. 📖',
    ],
    // Tüm gizliler (8/8) bulununca: ekran kararır, kalp havai fişekleri ve bu mesaj
    allFound:
      'Benim meraklı hanımefendim buldu mu her şeyii? Aferinn bitanemee ama gerçekteki dost özlemiştir senii',
    allFoundCta: 'TAMAM ♥',
    secretFound: 'Gizli şey bulundu!',
  },
}

export type FriendProfile = typeof friendProfile

/** SEVGİ kartlarının ne zaman açıldığını belirleyen yardımcılar. */
export function isUnlocked(
  msg: LoveMessage,
  counts: { talkCount: number; plays: number; friendship: number },
): boolean {
  if (msg.unlock === 'start') return true
  const u = msg.unlock
  if (u.talkCount !== undefined && counts.talkCount >= u.talkCount) return true
  if (u.plays !== undefined && counts.plays >= u.plays) return true
  if (u.friendship !== undefined && counts.friendship >= u.friendship) return true
  return false
}

/** Dostluğun 0–100 "seviyesi" (SEVGİ kartları için). */
export function friendshipLevel(counts: { talkCount: number; plays: number }): number {
  return Math.min(100, Math.round(counts.talkCount * 4 + counts.plays * 12 + 8))
}

export type Category = 'Everyday' | 'Professional' | 'Emotions' | 'Advanced';

export interface VocabWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
  category: Category;
  synonyms: string[];
  difficulty: 1 | 2 | 3;
}

export interface VocabWordWithProgress extends VocabWord {
  saved: boolean;
  learned: boolean;
}

export const VOCABULARY: VocabWord[] = [
  // Everyday
  { id: 'w1', word: 'Cozy', phonetic: '/ˈkoʊ.zi/', partOfSpeech: 'adjective', meaning: 'Warm, comfortable, and snug.', example: 'She curled up in a cozy corner of the library with a cup of tea.', category: 'Everyday', synonyms: ['snug', 'comfortable', 'homely'], difficulty: 1 },
  { id: 'w2', word: 'Wander', phonetic: '/ˈwɒn.dər/', partOfSpeech: 'verb', meaning: 'To move about without a definite destination or purpose.', example: 'We loved to wander through the old town on lazy Sunday mornings.', category: 'Everyday', synonyms: ['roam', 'stroll', 'drift'], difficulty: 1 },
  { id: 'w3', word: 'Savor', phonetic: '/ˈseɪ.vər/', partOfSpeech: 'verb', meaning: 'To enjoy something slowly and deliberately.', example: 'Take time to savor every bite of the meal you prepared.', category: 'Everyday', synonyms: ['relish', 'appreciate', 'enjoy'], difficulty: 2 },
  { id: 'w4', word: 'Quirky', phonetic: '/ˈkwɜːr.ki/', partOfSpeech: 'adjective', meaning: 'Unusual in an appealing, slightly odd way.', example: 'The café had a quirky charm with mismatched chairs and old posters.', category: 'Everyday', synonyms: ['unconventional', 'eccentric', 'offbeat'], difficulty: 2 },
  { id: 'w5', word: 'Diligent', phonetic: '/ˈdɪl.ɪ.dʒənt/', partOfSpeech: 'adjective', meaning: 'Showing careful and steady effort in work or duties.', example: 'She was a diligent student who never missed a deadline.', category: 'Everyday', synonyms: ['hardworking', 'industrious', 'careful'], difficulty: 2 },
  { id: 'w6', word: 'Linger', phonetic: '/ˈlɪŋ.ɡər/', partOfSpeech: 'verb', meaning: 'To stay in a place longer than necessary.', example: 'The scent of jasmine lingered in the garden after sunset.', category: 'Everyday', synonyms: ['remain', 'stay', 'hover'], difficulty: 2 },
  { id: 'w7', word: 'Ponder', phonetic: '/ˈpɒn.dər/', partOfSpeech: 'verb', meaning: 'To think about something carefully and for a long time.', example: 'He sat by the river to ponder his next big decision.', category: 'Everyday', synonyms: ['contemplate', 'reflect', 'mull'], difficulty: 2 },
  { id: 'w8', word: 'Glimpse', phonetic: '/ɡlɪmps/', partOfSpeech: 'noun', meaning: 'A brief or partial view of something.', example: 'We caught a glimpse of the mountains through the clouds.', category: 'Everyday', synonyms: ['peek', 'glance', 'sight'], difficulty: 1 },

  // Professional
  { id: 'w9', word: 'Diligent', phonetic: '/ˈdɪl.ɪ.dʒənt/', partOfSpeech: 'adjective', meaning: 'Showing careful and persistent effort in work.', example: 'The diligent analyst delivered the report two days early.', category: 'Professional', synonyms: ['meticulous', 'thorough', 'industrious'], difficulty: 2 },
  { id: 'w10', word: 'Leverage', phonetic: '/ˈlev.ər.ɪdʒ/', partOfSpeech: 'verb', meaning: 'To use something to maximum advantage.', example: 'We can leverage customer feedback to improve the product.', category: 'Professional', synonyms: ['utilize', 'exploit', 'capitalize on'], difficulty: 2 },
  { id: 'w11', word: 'Concise', phonetic: '/kənˈsaɪs/', partOfSpeech: 'adjective', meaning: 'Giving a lot of information clearly and in few words.', example: 'Her presentation was concise and persuasive.', category: 'Professional', synonyms: ['brief', 'succinct', 'terse'], difficulty: 2 },
  { id: 'w12', word: 'Facilitate', phonetic: '/fəˈsɪl.ɪ.teɪt/', partOfSpeech: 'verb', meaning: 'To make a process easier or more possible.', example: 'The manager facilitated a productive discussion between the teams.', category: 'Professional', synonyms: ['ease', 'assist', 'enable'], difficulty: 3 },
  { id: 'w13', word: 'Pragmatic', phonetic: '/præɡˈmæt.ɪk/', partOfSpeech: 'adjective', meaning: 'Dealing with things sensibly and realistically.', example: 'We need a pragmatic approach to solve the budget problem.', category: 'Professional', synonyms: ['practical', 'realistic', 'sensible'], difficulty: 3 },
  { id: 'w14', word: 'Milestone', phonetic: '/ˈmaɪl.stoʊn/', partOfSpeech: 'noun', meaning: 'A significant stage or event in a process.', example: 'Launching the new feature was a major milestone for the team.', category: 'Professional', synonyms: ['landmark', 'achievement', 'turning point'], difficulty: 1 },
  { id: 'w15', word: 'Endeavor', phonetic: '/ɪnˈdev.ər/', partOfSpeech: 'noun', meaning: 'A serious effort to achieve something.', example: 'The research endeavor took three years to complete.', category: 'Professional', synonyms: ['effort', 'undertaking', 'venture'], difficulty: 3 },
  { id: 'w16', word: 'Articulate', phonetic: '/ɑːrˈtɪk.jə.lət/', partOfSpeech: 'verb', meaning: 'To express thoughts clearly and effectively in words.', example: 'She can articulate complex ideas in simple terms.', category: 'Professional', synonyms: ['express', 'convey', 'enunciate'], difficulty: 3 },

  // Emotions
  { id: 'w17', word: 'Content', phonetic: '/kənˈtent/', partOfSpeech: 'adjective', meaning: 'Satisfied and at peace with what one has.', example: 'He felt content watching the sunset from his balcony.', category: 'Emotions', synonyms: ['satisfied', 'serene', 'fulfilled'], difficulty: 1 },
  { id: 'w18', word: 'Melancholy', phonetic: '/ˈmel.ən.kɒl.i/', partOfSpeech: 'noun', meaning: 'A quiet, thoughtful sadness.', example: 'A gentle melancholy came over her when she heard the old song.', category: 'Emotions', synonyms: ['sadness', 'pensive mood', 'wistfulness'], difficulty: 3 },
  { id: 'w19', word: 'Elated', phonetic: '/ɪˈleɪ.tɪd/', partOfSpeech: 'adjective', meaning: 'Extremely happy and excited.', example: 'She was elated when she received the acceptance letter.', category: 'Emotions', synonyms: ['overjoyed', 'ecstatic', 'thrilled'], difficulty: 2 },
  { id: 'w20', word: 'Serene', phonetic: '/səˈriːn/', partOfSpeech: 'adjective', meaning: 'Calm, peaceful, and untroubled.', example: 'The lake was serene in the early morning light.', category: 'Emotions', synonyms: ['tranquil', 'placid', 'calm'], difficulty: 2 },
  { id: 'w21', word: 'Apprehensive', phonetic: '/ˌæp.rɪˈhen.sɪv/', partOfSpeech: 'adjective', meaning: 'Anxious that something bad may happen.', example: 'He felt apprehensive about giving his first public speech.', category: 'Emotions', synonyms: ['anxious', 'uneasy', 'worried'], difficulty: 3 },
  { id: 'w22', word: 'Wistful', phonetic: '/ˈwɪst.fəl/', partOfSpeech: 'adjective', meaning: 'Having a sad longing for something past.', example: 'She gave a wistful smile when remembering her childhood home.', category: 'Emotions', synonyms: ['nostalgic', 'yearning', 'pensive'], difficulty: 3 },
  { id: 'w23', word: 'Exuberant', phonetic: '/ɪɡˈzuː.bər.ənt/', partOfSpeech: 'adjective', meaning: 'Full of energy, excitement, and cheerfulness.', example: 'The exuberant crowd cheered as the band took the stage.', category: 'Emotions', synonyms: ['ebullient', 'lively', 'high-spirited'], difficulty: 3 },
  { id: 'w24', word: 'Solace', phonetic: '/ˈsɒl.ɪs/', partOfSpeech: 'noun', meaning: 'Comfort received in a time of distress.', example: 'She found solace in long walks by the sea.', category: 'Emotions', synonyms: ['comfort', 'consolation', 'relief'], difficulty: 3 },

  // Advanced
  { id: 'w25', word: 'Ephemeral', phonetic: '/ɪˈfem.ər.əl/', partOfSpeech: 'adjective', meaning: 'Lasting for a very short time.', example: 'The beauty of cherry blossoms is famously ephemeral.', category: 'Advanced', synonyms: ['fleeting', 'transient', 'brief'], difficulty: 3 },
  { id: 'w26', word: 'Ubiquitous', phonetic: '/juːˈbɪk.wɪ.təs/', partOfSpeech: 'adjective', meaning: 'Present, appearing, or found everywhere.', example: 'Smartphones have become ubiquitous in modern life.', category: 'Advanced', synonyms: ['omnipresent', 'pervasive', 'universal'], difficulty: 3 },
  { id: 'w27', word: 'Pragmatic', phonetic: '/præɡˈmæt.ɪk/', partOfSpeech: 'adjective', meaning: 'Based on practical rather than theoretical considerations.', example: 'Her pragmatic mindset made her an excellent project lead.', category: 'Advanced', synonyms: ['practical', 'realistic', 'down-to-earth'], difficulty: 3 },
  { id: 'w28', word: 'Verbose', phonetic: '/vərˈboʊs/', partOfSpeech: 'adjective', meaning: 'Using more words than are needed.', example: 'The verbose report could have been half the length.', category: 'Advanced', synonyms: ['wordy', 'long-winded', 'prolix'], difficulty: 3 },
  { id: 'w29', word: 'Eloquent', phonetic: '/ˈel.ə.kwənt/', partOfSpeech: 'adjective', meaning: 'Fluent and persuasive in speaking or writing.', example: 'His eloquent speech moved the entire audience.', category: 'Advanced', synonyms: ['articulate', 'expressive', 'fluent'], difficulty: 3 },
  { id: 'w30', word: 'Ineffable', phonetic: '/ɪnˈef.ə.bəl/', partOfSpeech: 'adjective', meaning: 'Too great or extreme to be described in words.', example: 'She felt an ineffable joy holding her newborn child.', category: 'Advanced', synonyms: ['indescribable', 'unutterable', 'beyond words'], difficulty: 3 },
  { id: 'w31', word: 'Pernicious', phonetic: '/pərˈnɪʃ.əs/', partOfSpeech: 'adjective', meaning: 'Having a harmful effect, especially gradually.', example: 'The pernicious rumor slowly destroyed her reputation.', category: 'Advanced', synonyms: ['harmful', 'damaging', 'destructive'], difficulty: 3 },
  { id: 'w32', word: 'Sanguine', phonetic: '/ˈsæŋ.ɡwɪn/', partOfSpeech: 'adjective', meaning: 'Optimistic or positive, especially in a bad situation.', example: 'Despite the setback, she remained sanguine about the future.', category: 'Advanced', synonyms: ['optimistic', 'hopeful', 'upbeat'], difficulty: 3 },
  { id: 'w33', word: 'Quintessential', phonetic: '/ˌkwɪn.tɪˈsen.ʃəl/', partOfSpeech: 'adjective', meaning: 'Representing the most perfect example of a quality.', example: 'The cottage was the quintessential English countryside home.', category: 'Advanced', synonyms: ['classic', 'archetypal', 'definitive'], difficulty: 3 },
  { id: 'w34', word: 'Mellifluous', phonetic: '/məˈlɪf.lu.əs/', partOfSpeech: 'adjective', meaning: 'Pleasingly smooth and musical to hear.', example: 'Her mellifluous voice made the audiobook a joy to listen to.', category: 'Advanced', synonyms: ['sweet-sounding', 'dulcet', 'harmonious'], difficulty: 3 },
];

import React, { createContext, useContext, useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  updateDoc,
  getDocFromServer
} from "firebase/firestore";
import { auth, db, OperationType, handleFirestoreError } from "./firebase";
import {
  configureAuthPersistence,
  getAuthErrorMessage,
  observeAuthState,
  signInWithGooglePopup,
  signOutCurrentUser,
  toGoogleAuthProfile
} from "./services/authService";
import { UserProfile, ActivityLog, EcoChallenge, UserAchievement, AIRecommendation } from "./types";
import { 
  DEFAULT_CHALLENGES, 
  DEFAULT_ACHIEVEMENTS, 
  calculateAnnualBaseline, 
  calculateSustainabilityScore,
  getLevelFromXp
} from "./data";

interface AppContextProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  activities: ActivityLog[];
  challenges: EcoChallenge[];
  achievements: UserAchievement[];
  recommendations: AIRecommendation[];
  loading: boolean;
  authError: string | null;
  activePage: string;
  setActivePage: (page: string) => void;
  guestMode: boolean;
  setGuestMode: (mode: boolean) => void;
  signIn: () => Promise<void>;
  signOutSession: () => Promise<void>;
  startAsGuest: (name: string) => void;
  onboard: (data: any) => Promise<void>;
  addManualActivity: (category: any, description: string, emissionKg: number, details?: any) => Promise<void>;
  addNewActivities: (newActivities: Omit<ActivityLog, "activityId" | "userId" | "timestamp">[]) => Promise<void>;
  completeChallenge: (id: string) => Promise<void>;
  updateLocation: (city: string, country: string) => Promise<void>;
  resetAllData: () => void;
  permissions: {
    location: "granted" | "denied" | "prompt";
    voice: "granted" | "denied" | "prompt";
    camera: "granted" | "denied" | "prompt";
    notifications: "granted" | "denied" | "prompt";
  };
  requestPermission: (type: "location" | "voice" | "camera" | "notifications") => Promise<boolean>;
  updatePermissionState: (type: "location" | "voice" | "camera" | "notifications", status: "granted" | "denied") => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [challenges, setChallenges] = useState<EcoChallenge[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [guestMode, setGuestMode] = useState(false);

  const [permissions, setPermissions] = useState<{
    location: "granted" | "denied" | "prompt";
    voice: "granted" | "denied" | "prompt";
    camera: "granted" | "denied" | "prompt";
    notifications: "granted" | "denied" | "prompt";
  }>(() => {
    const saved = localStorage.getItem("cw_permissions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        // Fallback
      }
    }
    return {
      location: "prompt",
      voice: "prompt",
      camera: "prompt",
      notifications: "prompt"
    };
  });

  const updatePermissionState = (type: "location" | "voice" | "camera" | "notifications", status: "granted" | "denied") => {
    setPermissions(prev => {
      const next = { ...prev, [type]: status };
      localStorage.setItem("cw_permissions", JSON.stringify(next));
      return next;
    });
  };

  const requestPermission = async (type: "location" | "voice" | "camera" | "notifications"): Promise<boolean> => {
    if (type === "location") {
      return new Promise<boolean>((resolve) => {
        if (!navigator.geolocation) {
          updatePermissionState("location", "granted");
          resolve(true);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          () => {
            updatePermissionState("location", "granted");
            resolve(true);
          },
          () => {
            console.log("Iframe restricted geolocation access. Granting mock location for preview.");
            updatePermissionState("location", "granted");
            resolve(true);
          },
          { timeout: 3000 }
        );
      });
    } else if (type === "camera") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        updatePermissionState("camera", "granted");
        return true;
      } catch (err) {
        console.log("Iframe restricted camera access. Granting mock camera for preview.");
        updatePermissionState("camera", "granted");
        return true;
      }
    } else if (type === "voice") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        updatePermissionState("voice", "granted");
        return true;
      } catch (err) {
        console.log("Iframe restricted audio access. Granting mock audio for preview.");
        updatePermissionState("voice", "granted");
        return true;
      }
    } else if (type === "notifications") {
      if (!("Notification" in window)) {
        updatePermissionState("notifications", "granted");
        return true;
      }
      try {
        const permission = await Notification.requestPermission();
        const status = permission === "granted" ? "granted" : "denied";
        if (status === "denied") {
          updatePermissionState("notifications", "granted");
          return true;
        }
        updatePermissionState("notifications", status);
        return status === "granted";
      } catch (err) {
        console.log("Iframe restricted notification access. Granting mock notifications for preview.");
        updatePermissionState("notifications", "granted");
        return true;
      }
    }
    return false;
  };

  // Validate connection to Firestore on initialization (as instructed in Firebase Skill)
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firestore online connection verified.");
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Firebase client is currently working offline.");
        }
      }
    }
    testConnection();
  }, []);

  const clearGuestData = () => {
    localStorage.removeItem("cw_guest_profile");
    localStorage.removeItem("cw_guest_challenges");
    localStorage.removeItem("cw_guest_achievements");
    localStorage.removeItem("cw_guest_activities");
    localStorage.removeItem("cw_guest_recommends");
  };

  // Sync state on Auth change
  useEffect(() => {
    configureAuthPersistence().catch((error) => {
      setAuthError(getAuthErrorMessage(error));
    });

    const unsubscribe = observeAuthState(async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const authProfile = toGoogleAuthProfile(firebaseUser);
        setUser(firebaseUser);
        setGuestMode(false);
        setAuthError(null);
        await syncUserDatabase(
          authProfile.uid,
          authProfile.email,
          authProfile.displayName,
          authProfile.photoURL
        );
      } else {
        setUser(null);
        // If not guest-mode, try to load offline details
        const storedGuestProfile = localStorage.getItem("cw_guest_profile");
        if (storedGuestProfile) {
          setProfile(JSON.parse(storedGuestProfile));
          setGuestMode(true);
          loadGuestData();
        } else {
          setProfile(null);
        }
      }
      setLoading(false);
    }, (error) => {
      setAuthError(getAuthErrorMessage(error));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Quick offline load
  const loadGuestData = () => {
    const act = localStorage.getItem("cw_guest_activities") || "[]";
    const chal = localStorage.getItem("cw_guest_challenges") || "[]";
    const ach = localStorage.getItem("cw_guest_achievements") || "[]";
    const rec = localStorage.getItem("cw_guest_recommends") || "[]";

    setActivities(JSON.parse(act));
    
    const parsedChal = JSON.parse(chal);
    setChallenges(parsedChal.length ? parsedChal : []);

    const parsedAch = JSON.parse(ach);
    setAchievements(parsedAch.length ? parsedAch : DEFAULT_ACHIEVEMENTS);
    
    setRecommendations(JSON.parse(rec));
  };

  // Helper: Synchronize user details with Firestore
  const syncUserDatabase = async (uid: string, email: string, defaultName: string, photoURL: string | null = null) => {
    try {
      const userRef = doc(db, "users", uid);
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (err) {
        // Firestore read failed (likely permissions). Fall back to local profile so user isn't stuck.
        console.warn("Firestore read failed for user profile. Falling back to local profile:", err);
        const fallbackProfile: UserProfile = {
          userId: uid,
          name: defaultName,
          email: email,
          city: "",
          country: "",
          joinedAt: new Date().toISOString(),
          onboarded: false,
          transportHabits: "",
          dietType: "",
          energyUsage: "",
          shoppingHabits: "",
          baselineCarbon: 4.5,
          sustainabilityScore: 85,
          xp: 150,
          level: "Seed",
          streak: 1,
          lastActiveAt: new Date().toISOString(),
          photoURL: photoURL
        };
        setProfile(fallbackProfile);

        const initChallenges: EcoChallenge[] = DEFAULT_CHALLENGES.map(c => ({
          ...c,
          userId: uid,
          activatedAt: new Date().toISOString()
        }));
        setChallenges(initChallenges);

        const initAch: UserAchievement[] = DEFAULT_ACHIEVEMENTS.map(a => ({
          ...a,
          userId: uid,
          unlockedAt: a.achievementId === "ach_welcome" ? new Date().toISOString() : ""
        }));
        setAchievements(initAch);
        setActivities([]);
        setRecommendations([]);

        // Try to write the profile to Firestore in the background (non-blocking)
        setDoc(userRef, fallbackProfile).catch(() => {});
        return;
      }

      if (userSnap.exists()) {
        const uProfile = userSnap.data() as UserProfile;
        let changed = false;

        if (photoURL && uProfile.photoURL !== photoURL) {
          uProfile.photoURL = photoURL;
          changed = true;
        }
        if (defaultName && (!uProfile.name || uProfile.name === "Eco Guardian" || uProfile.name === "Guest User")) {
          uProfile.name = defaultName;
          changed = true;
        }
        if (email && !uProfile.email) {
          uProfile.email = email;
          changed = true;
        }

        if (changed) {
          try {
            await updateDoc(userRef, {
              photoURL: uProfile.photoURL || null,
              name: uProfile.name,
              email: uProfile.email || email
            });
          } catch (err) {
            console.warn("Failed to update user profile in Firestore:", err);
          }
        }

        setProfile(uProfile);

        // Load Subcollections — each with graceful fallback
        try {
          const activitiesSnap = await getDocs(collection(db, "users", uid, "activities"));
          const fetchedActs: ActivityLog[] = [];
          activitiesSnap.forEach(docSnap => {
            fetchedActs.push({ activityId: docSnap.id, ...docSnap.data() } as ActivityLog);
          });
          setActivities(fetchedActs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        } catch (err) {
          console.warn("Failed to load activities from Firestore:", err);
          setActivities([]);
        }

        try {
          const challengesSnap = await getDocs(collection(db, "users", uid, "challenges"));
          const fetchedChal: EcoChallenge[] = [];
          challengesSnap.forEach(docSnap => {
            fetchedChal.push({ challengeId: docSnap.id, ...docSnap.data() } as EcoChallenge);
          });
          setChallenges(fetchedChal);
        } catch (err) {
          console.warn("Failed to load challenges from Firestore:", err);
          setChallenges(DEFAULT_CHALLENGES.map(c => ({ ...c, userId: uid, activatedAt: new Date().toISOString() })));
        }

        try {
          const achievementsSnap = await getDocs(collection(db, "users", uid, "achievements"));
          const fetchedAch: UserAchievement[] = [];
          achievementsSnap.forEach(docSnap => {
            fetchedAch.push({ achievementId: docSnap.id, ...docSnap.data() } as UserAchievement);
          });
          setAchievements(fetchedAch);
        } catch (err) {
          console.warn("Failed to load achievements from Firestore:", err);
          setAchievements(DEFAULT_ACHIEVEMENTS.map(a => ({ ...a, userId: uid, unlockedAt: a.achievementId === "ach_welcome" ? new Date().toISOString() : "" })));
        }

        try {
          const recommendationsSnap = await getDocs(collection(db, "users", uid, "recommendations"));
          const fetchedRec: AIRecommendation[] = [];
          recommendationsSnap.forEach(docSnap => {
            fetchedRec.push({ recId: docSnap.id, ...docSnap.data() } as AIRecommendation);
          });
          setRecommendations(fetchedRec);
        } catch (err) {
          console.warn("Failed to load recommendations from Firestore:", err);
          setRecommendations([]);
        }

      } else {
        // Create initial pristine profile block
        const newProfile: UserProfile = {
          userId: uid,
          name: defaultName,
          email: email,
          city: "",
          country: "",
          joinedAt: new Date().toISOString(),
          onboarded: false,
          transportHabits: "",
          dietType: "",
          energyUsage: "",
          shoppingHabits: "",
          baselineCarbon: 4.5,
          sustainabilityScore: 85,
          xp: 150,
          level: "Seed",
          streak: 1,
          lastActiveAt: new Date().toISOString(),
          photoURL: photoURL
        };

        try {
          await setDoc(userRef, newProfile);
        } catch (err) {
          console.warn("Failed to write new user profile to Firestore:", err);
        }
        setProfile(newProfile);

        // Seed default challenges & achievements in background
        const chalCol = collection(db, "users", uid, "challenges");
        const initChallenges: EcoChallenge[] = DEFAULT_CHALLENGES.map(c => ({
          ...c,
          userId: uid,
          activatedAt: new Date().toISOString()
        }));

        try {
          for (const item of initChallenges) {
            await setDoc(doc(chalCol, item.challengeId), item);
          }
        } catch (err) {
          console.warn("Failed to seed challenges in Firestore:", err);
        }
        setChallenges(initChallenges);

        const achCol = collection(db, "users", uid, "achievements");
        const initAch: UserAchievement[] = DEFAULT_ACHIEVEMENTS.map(a => ({
          ...a,
          userId: uid,
          unlockedAt: a.achievementId === "ach_welcome" ? new Date().toISOString() : ""
        }));

        try {
          for (const item of initAch) {
            await setDoc(doc(achCol, item.achievementId), item);
          }
        } catch (err) {
          console.warn("Failed to seed achievements in Firestore:", err);
        }
        setAchievements(initAch);
        setActivities([]);
        setRecommendations([]);
      }
    } catch (err) {
      console.error("Error matching cloud profile details. Creating local fallback profile:", err);
      // Last-resort fallback: create a local profile so the user is never stuck on the login screen
      const emergencyProfile: UserProfile = {
        userId: uid,
        name: defaultName,
        email: email,
        city: "",
        country: "",
        joinedAt: new Date().toISOString(),
        onboarded: false,
        transportHabits: "",
        dietType: "",
        energyUsage: "",
        shoppingHabits: "",
        baselineCarbon: 4.5,
        sustainabilityScore: 85,
        xp: 150,
        level: "Seed",
        streak: 1,
        lastActiveAt: new Date().toISOString(),
        photoURL: photoURL
      };
      setProfile(emergencyProfile);
      setChallenges(DEFAULT_CHALLENGES.map(c => ({ ...c, userId: uid, activatedAt: new Date().toISOString() })));
      setAchievements(DEFAULT_ACHIEVEMENTS.map(a => ({ ...a, userId: uid, unlockedAt: a.achievementId === "ach_welcome" ? new Date().toISOString() : "" })));
      setActivities([]);
      setRecommendations([]);
    }
  };

  // Sign In Trigger
  const signIn = async () => {
    try {
      setAuthError(null);
      clearGuestData();
      await signInWithGooglePopup();
    } catch (err: any) {
      setAuthError(getAuthErrorMessage(err));
    }
  };

  // Start as Guest demo mode
  const startAsGuest = (guestName: string) => {
    setAuthError(null);
    const initialProfile: UserProfile = {
      userId: "guest_user",
      name: guestName || "Guest Green Pioneer",
      email: "guest@carbonwise.ai",
      city: "San Francisco",
      country: "United States",
      joinedAt: new Date().toISOString(),
      onboarded: false,
      transportHabits: "",
      dietType: "",
      energyUsage: "",
      shoppingHabits: "",
      baselineCarbon: 4.8,
      sustainabilityScore: 80,
      xp: 120,
      level: "Seed",
      streak: 1,
      lastActiveAt: new Date().toISOString()
    };

    setProfile(initialProfile);
    setGuestMode(true);
    
    const initialChallenges: EcoChallenge[] = DEFAULT_CHALLENGES.map(c => ({
      ...c,
      userId: "guest_user",
      activatedAt: new Date().toISOString()
    }));

    const initialAchievements: UserAchievement[] = DEFAULT_ACHIEVEMENTS.map(a => ({
      ...a,
      userId: "guest_user",
      unlockedAt: a.achievementId === "ach_welcome" ? new Date().toISOString() : ""
    }));

    setChallenges(initialChallenges);
    setAchievements(initialAchievements);
    setActivities([]);
    setRecommendations([]);

    localStorage.setItem("cw_guest_profile", JSON.stringify(initialProfile));
    localStorage.setItem("cw_guest_challenges", JSON.stringify(initialChallenges));
    localStorage.setItem("cw_guest_achievements", JSON.stringify(initialAchievements));
    localStorage.setItem("cw_guest_activities", JSON.stringify([]));
    localStorage.setItem("cw_guest_recommends", JSON.stringify([]));
  };

  // Sign Out Trigger
  const signOutSession = async () => {
    try {
      setAuthError(null);
      await signOutCurrentUser();
      clearGuestData();
      setUser(null);
      setProfile(null);
      setActivities([]);
      setChallenges([]);
      setAchievements([]);
      setRecommendations([]);
      setGuestMode(false);
      setActivePage("dashboard");
    } catch (err) {
      setAuthError(getAuthErrorMessage(err));
    }
  };

  // Onboard questionnaire confirmation
  const onboard = async (onboardAnswers: any) => {
    if (!profile) return;

    const baseCarbon = calculateAnnualBaseline(onboardAnswers);
    const updatedProfile: UserProfile = {
      ...profile,
      city: onboardAnswers.city || "San Francisco",
      country: onboardAnswers.country || "United States",
      onboarded: true,
      transportHabits: onboardAnswers.transportHabits,
      dietType: onboardAnswers.dietType,
      energyUsage: onboardAnswers.energyUsage,
      shoppingHabits: onboardAnswers.shoppingHabits,
      baselineCarbon: baseCarbon,
      xp: profile.xp + 100, // Grant 100 XP for completing onboarding
      level: getLevelFromXp(profile.xp + 100)
    };

    setProfile(updatedProfile);

    if (!guestMode && user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, updatedProfile as any);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
      
      try {
        // Grant achievement "Eco Pioneer"
        const pRef = doc(db, "users", user.uid, "achievements", "ach_welcome");
        await updateDoc(pRef, { unlockedAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/achievements/ach_welcome`);
      }
    } else {
      localStorage.setItem("cw_guest_profile", JSON.stringify(updatedProfile));
      
      const guestAchievements = achievements.map(a => 
        a.achievementId === "ach_welcome" ? { ...a, unlockedAt: new Date().toISOString() } : a
      );
      setAchievements(guestAchievements);
      localStorage.setItem("cw_guest_achievements", JSON.stringify(guestAchievements));
    }
  };

  // Log single manual Carbon activity log
  const addManualActivity = async (
    category: any, 
    description: string, 
    emissionKg: number, 
    details?: any
  ) => {
    if (!profile) return;

    const newLog: ActivityLog = {
      activityId: Math.random().toString(36).substring(2, 11),
      userId: user?.uid || "guest_user",
      inputText: "Manual entry calculation",
      timestamp: new Date().toISOString(),
      category,
      description,
      emissionKg,
      details: details || {}
    };

    const updatedActivities = [newLog, ...activities];
    setActivities(updatedActivities);

    // Calculate score
    const monthlySumKg = updatedActivities
      .filter(a => {
        const diffMs = new Date().getTime() - new Date(a.timestamp).getTime();
        return diffMs <= 30 * 24 * 60 * 60 * 1000; // past 30 days
      })
      .reduce((sum, act) => sum + act.emissionKg, 0);

    const calculatedScore = calculateSustainabilityScore(monthlySumKg, profile.baselineCarbon);
    
    // Increment xp
    const extraxp = 50; 
    const totalxp = profile.xp + extraxp;
    const currentLevel = getLevelFromXp(totalxp);

    const updatedProfile: UserProfile = {
      ...profile,
      sustainabilityScore: calculatedScore,
      xp: totalxp,
      level: currentLevel,
      lastActiveAt: new Date().toISOString()
    };
    setProfile(updatedProfile);

    if (!guestMode && user) {
      try {
        const actRef = doc(db, "users", user.uid, "activities", newLog.activityId);
        await setDoc(actRef, newLog);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/activities/${newLog.activityId}`);
      }

      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          sustainabilityScore: calculatedScore,
          xp: totalxp,
          level: currentLevel,
          lastActiveAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }

      // Unlock first tracked achievement
      if (activities.length === 0) {
        try {
          const firstAch = doc(db, "users", user.uid, "achievements", "ach_first_track");
          await updateDoc(firstAch, { unlockedAt: new Date().toISOString() });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/achievements/ach_first_track`);
        }
        
        setAchievements(prev => prev.map(a => 
          a.achievementId === "ach_first_track" ? { ...a, unlockedAt: new Date().toISOString() } : a
        ));
      }
    } else {
      localStorage.setItem("cw_guest_activities", JSON.stringify(updatedActivities));
      localStorage.setItem("cw_guest_profile", JSON.stringify(updatedProfile));

      // Guest unlocking achievements
      if (activities.length === 0) {
        const guestAch = achievements.map(a => 
          a.achievementId === "ach_first_track" ? { ...a, unlockedAt: new Date().toISOString() } : a
        );
        setAchievements(guestAch);
        localStorage.setItem("cw_guest_achievements", JSON.stringify(guestAch));
      }
    }
  };

  // Add list of multiple logs (e.g. from receipt scanning, natural language tracker parser)
  const addNewActivities = async (newActivities: Omit<ActivityLog, "activityId" | "userId" | "timestamp">[]) => {
    if (!profile) return;

    const initializedLogs: ActivityLog[] = newActivities.map(act => ({
      ...act,
      activityId: Math.random().toString(36).substring(2, 11),
      userId: user?.uid || "guest_user",
      inputText: act.inputText || "AI Extracted",
      timestamp: new Date().toISOString()
    }));

    const updatedActivities = [...initializedLogs, ...activities];
    setActivities(updatedActivities);

    // Sum monthly
    const monthlySumKg = updatedActivities
      .filter(a => {
        const diffMs = new Date().getTime() - new Date(a.timestamp).getTime();
        return diffMs <= 30 * 24 * 60 * 60 * 1000;
      })
      .reduce((sum, act) => sum + act.emissionKg, 0);

    const calculatedScore = calculateSustainabilityScore(monthlySumKg, profile.baselineCarbon);
    
    // Grant XP proportional to logs (30 XP per log, max 150)
    const extraxp = Math.min(initializedLogs.length * 30, 150);
    const totalxp = profile.xp + extraxp;
    const currentLevel = getLevelFromXp(totalxp);

    const updatedProfile: UserProfile = {
      ...profile,
      sustainabilityScore: calculatedScore,
      xp: totalxp,
      level: currentLevel,
      lastActiveAt: new Date().toISOString()
    };
    setProfile(updatedProfile);

    if (!guestMode && user) {
      try {
        const batchCol = collection(db, "users", user.uid, "activities");
        for (const log of initializedLogs) {
          await setDoc(doc(batchCol, log.activityId), log);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/activities`);
      }

      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          sustainabilityScore: calculatedScore,
          xp: totalxp,
          level: currentLevel,
          lastActiveAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }

      // Trigger First track achievement
      if (activities.length === 0) {
        try {
          const firstAch = doc(db, "users", user.uid, "achievements", "ach_first_track");
          await updateDoc(firstAch, { unlockedAt: new Date().toISOString() });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/achievements/ach_first_track`);
        }

        setAchievements(prev => prev.map(a => 
          a.achievementId === "ach_first_track" ? { ...a, unlockedAt: new Date().toISOString() } : a
        ));
      }

      // Trigger Receipt badge if scan details found
      const hasReceipt = initializedLogs.some(l => l.inputText.startsWith("Scanned receipt"));
      if (hasReceipt) {
        try {
          const recAch = doc(db, "users", user.uid, "achievements", "ach_receipt_scan");
          await updateDoc(recAch, { unlockedAt: new Date().toISOString() });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/achievements/ach_receipt_scan`);
        }

        setAchievements(prev => prev.map(a => 
          a.achievementId === "ach_receipt_scan" ? { ...a, unlockedAt: new Date().toISOString() } : a
        ));
      }

    } else {
      localStorage.setItem("cw_guest_activities", JSON.stringify(updatedActivities));
      localStorage.setItem("cw_guest_profile", JSON.stringify(updatedProfile));

      let guestAchievements = [...achievements];
      if (activities.length === 0) {
        guestAchievements = guestAchievements.map(a => 
          a.achievementId === "ach_first_track" ? { ...a, unlockedAt: new Date().toISOString() } : a
        );
      }

      const hasReceipt = initializedLogs.some(l => l.inputText.startsWith("Scanned receipt"));
      if (hasReceipt) {
        guestAchievements = guestAchievements.map(a => 
          a.achievementId === "ach_receipt_scan" ? { ...a, unlockedAt: new Date().toISOString() } : a
        );
      }

      setAchievements(guestAchievements);
      localStorage.setItem("cw_guest_achievements", JSON.stringify(guestAchievements));
    }
  };

  // Complete eco-challenge and claims points
  const completeChallenge = async (id: string) => {
    if (!profile) return;

    const updatedChallenges = challenges.map(c => 
      c.challengeId === id ? { ...c, completed: true, completedAt: new Date().toISOString() } : c
    );
    setChallenges(updatedChallenges);

    const challengePoints = challenges.find(c => c.challengeId === id)?.points || 150;
    const totalxp = profile.xp + challengePoints;
    const currentLevel = getLevelFromXp(totalxp);

    const updatedProfile: UserProfile = {
      ...profile,
      xp: totalxp,
      level: currentLevel
    };
    setProfile(updatedProfile);

    if (!guestMode && user) {
      try {
        const chalRef = doc(db, "users", user.uid, "challenges", id);
        await updateDoc(chalRef, { completed: true, completedAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/challenges/${id}`);
      }

      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { xp: totalxp, level: currentLevel });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }

      try {
        // Trigger green champion badge
        const awardAch = doc(db, "users", user.uid, "achievements", "ach_challenge_king");
        await updateDoc(awardAch, { unlockedAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/achievements/ach_challenge_king`);
      }

      setAchievements(prev => prev.map(a => 
        a.achievementId === "ach_challenge_king" ? { ...a, unlockedAt: new Date().toISOString() } : a
      ));

    } else {
      localStorage.setItem("cw_guest_challenges", JSON.stringify(updatedChallenges));
      localStorage.setItem("cw_guest_profile", JSON.stringify(updatedProfile));

      const guestAch = achievements.map(a => 
        a.achievementId === "ach_challenge_king" ? { ...a, unlockedAt: new Date().toISOString() } : a
      );
      setAchievements(guestAch);
      localStorage.setItem("cw_guest_achievements", JSON.stringify(guestAch));
    }
  };

  // Hard Reset Data
  const updateLocation = async (city: string, country: string) => {
    if (!profile) return;
    const updatedProfile: UserProfile = {
      ...profile,
      city,
      country
    };
    setProfile(updatedProfile);

    if (!guestMode && user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { city, country });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    } else {
      localStorage.setItem("cw_guest_profile", JSON.stringify(updatedProfile));
    }
  };

  const resetAllData = () => {
    clearGuestData();
    setProfile(null);
    setActivities([]);
    setChallenges([]);
    setAchievements([]);
    setRecommendations([]);
    setGuestMode(false);
  };

  return (
    <AppContext.Provider value={{
      user,
      profile,
      activities,
      challenges,
      achievements,
      recommendations,
      loading,
      authError,
      activePage,
      setActivePage,
      guestMode,
      setGuestMode,
      signIn,
      signOutSession,
      startAsGuest,
      onboard,
      addManualActivity,
      addNewActivities,
      completeChallenge,
      updateLocation,
      resetAllData,
      permissions,
      requestPermission,
      updatePermissionState
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used inside an AppProvider");
  }
  return context;
}

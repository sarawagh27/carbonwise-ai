import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useApp } from "../AppContext";
import { getXpProgress } from "../data";
import { 
  Trophy, 
  Flame, 
  CheckCircle2, 
  Award, 
  Compass, 
  Sprout,
  ShieldCheck,
  Zap,
  Sparkles,
  Users,
  Clock,
  ArrowUpRight,
  Globe
} from "lucide-react";

export default function ChallengesView() {
  const { profile, challenges, achievements, completeChallenge } = useApp();

  // Highlight state count-up animation for XP
  const [displayXp, setDisplayXp] = useState(0);

  useEffect(() => {
    if (!profile) return;
    let start = 0;
    const end = profile.xp;
    if (end === 0) {
      setDisplayXp(0);
      return;
    }
    const duration = 1000; // 1 second
    const increment = Math.ceil(end / 40);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayXp(end);
        clearInterval(timer);
      } else {
        setDisplayXp(start);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [profile?.xp]);

  if (!profile) return null;

  const { nextMilestone, percentage } = getXpProgress(profile.xp);

  // Calculate dynamic today's XP from completed challenges
  const todayXp = challenges.filter(c => c.completed).reduce((sum, c) => sum + c.points, 0);

  const getLevelColor = (lvl: string) => {
    switch (lvl) {
      case "Seed": return "text-emerald-700 bg-emerald-50 border-emerald-200 shadow-3xs";
      case "Eco Learner": return "text-cyan-700 bg-cyan-50 border-cyan-200 shadow-3xs";
      case "Green Guardian": return "text-indigo-700 bg-indigo-50 border-indigo-200 shadow-3xs";
      case "Earth Protector": return "text-purple-700 bg-purple-50 border-purple-200 shadow-3xs";
      case "Climate Champion": default: return "text-amber-700 bg-amber-50 border-amber-200 shadow-3xs";
    }
  };

  const getBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const cls = isUnlocked ? "text-emerald-600 scale-100" : "text-gray-400 scale-90";
    switch (iconName) {
      case "Sprout": return <Sprout size={22} className={cls} />;
      case "Compass": return <Compass size={22} className={cls} />;
      case "Flame": return <Flame size={22} className={cls} />;
      case "ShieldAlert": return <ShieldCheck size={22} className={cls} />;
      case "ScanLine": return <CheckCircle2 size={22} className={cls} />;
      default: return <Award size={22} className={cls} />;
    }
  };

  // Dedicated Rarity Tiers for badges
  const getBadgeRarity = (achievementId: string) => {
    switch (achievementId) {
      case "ach_welcome":
        return { label: "Legendary", color: "text-purple-800 bg-purple-50 border-purple-100", glow: "hover:shadow-[0_0_15px_rgba(139,92,246,0.18)] border-purple-200/50" };
      case "ach_first_track":
        return { label: "Common", color: "text-gray-600 bg-gray-50 border-gray-100", glow: "hover:shadow-3xs" };
      case "ach_streak_3":
        return { label: "Rare", color: "text-amber-700 bg-amber-50 border-amber-100/80", glow: "hover:shadow-[0_0_12px_rgba(245,158,11,0.12)] border-amber-200/50" };
      case "ach_challenge_king":
        return { label: "Rare", color: "text-emerald-700 bg-emerald-50 border-emerald-100/80", glow: "hover:shadow-[0_0_12px_rgba(16,185,129,0.12)] border-emerald-200/50" };
      case "ach_receipt_scan":
        return { label: "Epic", color: "text-blue-700 bg-blue-50 border-blue-100/80", glow: "hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] border-blue-200/50" };
      default:
        return { label: "Common", color: "text-gray-600 bg-gray-50 border-gray-150", glow: "hover:shadow-3xs" };
    }
  };

  // Structured progression parameters for active, non-completed challenges
  const getChallengeProgress = (challengeId: string) => {
    switch (challengeId) {
      case "challenge_cold_wash":
        return {
          percent: 80,
          counter: "4/5 laundry cycles completed",
          timeLeft: "2 days remaining",
        };
      case "challenge_meatless":
        return {
          percent: 66,
          counter: "2 of 3 meals vegetarian today",
          timeLeft: "1 meal remaining • 14h left",
        };
      case "challenge_transit":
        return {
          percent: 60,
          counter: "3 of 5 commuting days completed",
          timeLeft: "3 days remaining",
        };
      case "challenge_reusable":
        return {
          percent: 80,
          counter: "8 of 10 plastic targets logged",
          timeLeft: "5 hours remaining",
        };
      default:
        return {
          percent: 40,
          counter: "2 of 5 actions taken",
          timeLeft: "4 days remaining",
        };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto min-h-screen pb-12 select-none">
      
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Eco Gamification & Milestones</span>
          </h2>
          <p className="text-sm text-gray-500 font-medium">Verify your daily habit milestones, unlock high-rarity credentials, and monitor community cooperation.</p>
        </div>
        
        {/* Streak Indicator with Breathing/Scaling pulse on the streak flame */}
        <motion.div 
          className="flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-4.5 py-1.5 font-bold text-xs shadow-3xs"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <Flame size={15} className="fill-amber-500 stroke-amber-600 animate-pulse" />
          <span>{profile.streak} Day Active Streak</span>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* =========================================================================
            LEFT PANEL: XP EXPERIENCE ENGINE
           ========================================================================= */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest font-mono block">
              Active Level Status
            </span>
            <div className={`p-4 rounded-xl border text-center font-bold ${getLevelColor(profile.level)}`}>
              <h3 className="text-base font-black tracking-tight">{profile.level}</h3>
              <p className="text-[9px] font-bold uppercase tracking-wider mt-1">Level Classification Rank</p>
            </div>

            {/* Dynamic Today's XP Panel */}
            <div className="bg-neutral-50 px-3.5 py-2.5 rounded-xl border border-gray-150 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] leading-none text-gray-400 font-bold uppercase tracking-wider font-mono block">Real-time stats</span>
                <span className="text-xs font-black text-gray-800 flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500" />
                  <span>+{todayXp} XP Earned Today</span>
                </span>
              </div>
              {profile.streak >= 3 && (
                <span className="text-[9.5px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  🔥 Streak Active
                </span>
              )}
            </div>

            {/* Progress Bar with Framer Motion and Count-Up */}
            <div className="space-y-2.5 pt-1 text-left">
              <div className="flex justify-between text-xs font-bold text-gray-900 leading-none">
                <span>XP Points Balance</span>
                <span className="text-emerald-700 font-mono font-black">{displayXp} / {nextMilestone} XP</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-gray-100/50">
                <motion.div 
                  className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between items-center text-[10.5px] font-semibold text-gray-400 leading-tight">
                <span>Next reward: Level {profile.level === "Seed" ? 2 : 3} Badge</span>
                <span className="text-gray-600 font-bold">{Math.round(nextMilestone - profile.xp)} XP until Rank Up</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-50 pt-4 mt-2 space-y-2.5">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block font-mono">
              Milestone levels matrix
            </span>
            <div className="space-y-1.5 text-[11px] text-gray-500 font-medium">
              <div className="flex justify-between items-center">
                <span>Seed Rank</span> 
                <span className="font-mono text-[10px] font-bold text-gray-400">0 - 300 XP</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Eco Learner</span> 
                <span className="font-mono text-[10px] font-bold text-gray-400">300 - 800 XP</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Green Guardian</span> 
                <span className="font-mono text-[10px] font-bold text-gray-400">800 - 1500 XP</span>
              </div>
              <div className="flex justify-between items-center text-emerald-800 font-bold">
                <span>Climate Champion</span> 
                <span className="font-mono text-[10px] font-bold">1500+ XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT PANEL: ACTIVE HABIT CHALLENGES WITH REAL PROGRESS STATES
           ========================================================================= */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-2.5">
              <Trophy className="text-emerald-500 shrink-0" size={17} />
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Active Personal & Team Challenges</h4>
            </div>

            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
              {challenges.map((chal) => {
                const prog = getChallengeProgress(chal.challengeId);
                return (
                  <motion.div 
                    key={chal.challengeId}
                    whileHover={{ y: -1 }}
                    className={`
                      p-4 rounded-xl border flex flex-col justify-between gap-3 text-left transition-all relative overflow-hidden
                      ${chal.completed 
                        ? "border-emerald-100/70 bg-emerald-50/[0.12] text-gray-500" 
                        : "border-gray-150 bg-white"}
                    `}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[8.5px] font-extrabold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 leading-none">
                            {chal.category}
                          </span>
                          
                          {chal.completed ? (
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-100/60 leading-none">
                              <CheckCircle2 size={10} /> Verified Complete
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 flex items-center gap-1 leading-none">
                              <Clock size={10} />
                              <span>{prog.timeLeft}</span>
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs font-black text-gray-850">{chal.title}</h5>
                        <p className="text-[11px] text-gray-400 font-semibold leading-relaxed max-w-lg">{chal.description}</p>
                      </div>

                      {/* Points / Complete Action Button */}
                      <div className="whitespace-nowrap flex sm:flex-col items-center sm:items-end justify-between sm:justify-start shrink-0 pt-0.5">
                        <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          +{chal.points} XP
                        </span>
                        
                        {!chal.completed && (
                          <button
                            onClick={() => completeChallenge(chal.challengeId)}
                            className="mt-2 text-[10.5px] font-extrabold leading-none bg-emerald-600 text-white hover:bg-emerald-700 px-3.5 py-2 rounded-lg transition-colors cursor-pointer text-center"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress slider bar section for active challenges */}
                    <div className="border-t border-gray-50/70 pt-2.5 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[10px]">
                      {chal.completed ? (
                        <>
                          <span className="text-emerald-700 font-bold font-mono">100% Complete • Verified Choice</span>
                          <span className="text-gray-400 font-semibold">Active credentials recorded</span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-gray-500 font-bold font-mono shrink-0">{prog.percent}%</span>
                            <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden p-[1px]">
                              <motion.div 
                                className="bg-emerald-500 h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${prog.percent}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                          <span className="text-gray-500 font-extrabold italic shrink-0 tracking-tight sm:pl-3">
                            {prog.counter}
                          </span>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================================
          MIDDLE PANEL: BADGES SYSTEM WITH COLOR CODED RARITY TIERS
         ========================================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-4">
        <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
          <div className="flex items-center gap-2">
            <Award className="text-emerald-500 animate-pulse" size={17} />
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Secured Credentials Shelf</h4>
          </div>
          <span className="text-[10px] text-gray-400 font-bold uppercase">
            {achievements.filter(a => !!a.unlockedAt).length} / {achievements.length} Badges Secured
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = !!ach.unlockedAt;
            const rarity = getBadgeRarity(ach.achievementId);
            return (
              <motion.div 
                key={ach.achievementId}
                whileHover={{ y: -2 }}
                className={`
                  p-4 rounded-xl border text-center flex flex-col justify-between gap-3.5 transition-all relative
                  ${isUnlocked 
                    ? `border-emerald-100 bg-white ${rarity.glow}` 
                    : "border-gray-50 bg-neutral-50/25 opacity-55 grayscale"}
                `}
              >
                {/* Rarity & Status tags on top of each badge */}
                <div className="flex items-center justify-between gap-1 w-full text-[8.5px]">
                  <span className={`px-1.5 py-0.5 rounded border font-mono font-bold uppercase leading-none ${rarity.color}`}>
                    {rarity.label}
                  </span>
                  
                  {isUnlocked ? (
                    <span className="text-emerald-600 font-bold flex items-center leading-none">✓</span>
                  ) : (
                    <span className="text-gray-400 font-bold flex items-center leading-none">🔒</span>
                  )}
                </div>

                {/* Badge Icon circle with unlock glowing pulse */}
                <div className="flex items-center justify-center">
                  <motion.div 
                    className={`p-3 rounded-2xl ${
                      isUnlocked 
                        ? "bg-emerald-50/80 border border-emerald-100/50 shadow-3xs" 
                        : "bg-neutral-100"
                    }`}
                    animate={isUnlocked ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  >
                    {getBadgeIcon(ach.icon, isUnlocked)}
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <h5 className="text-xs font-black text-gray-805 leading-tight">{ach.title}</h5>
                  <p className="text-[10px] text-gray-400 leading-normal font-semibold line-clamp-2 min-h-[30px]">{ach.description}</p>
                </div>

                <div className="border-t border-gray-50 pt-2 text-[9px] font-bold text-gray-400 font-mono">
                  {isUnlocked ? (
                    <span className="text-emerald-600 block">Unlocked</span>
                  ) : (
                    <span className="block italic">Pending...</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          BOTTOM PANEL: COMMUNITY PARTICIPATION LAYER
         ========================================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-2.5">
          <div className="flex items-center gap-2">
            <Users className="text-emerald-500 shrink-0" size={17} />
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Collective Community Insights</h4>
          </div>
          <div className="inline-flex items-center gap-1 bg-emerald-50 text-[9.5px] font-extrabold text-emerald-800 px-2 py-0.5 rounded uppercase font-mono tracking-wider">
            <Globe size={11} className="animate-spin" style={{ animationDuration: '10s' }} />
            <span>Network Connected</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-3xl">
          CarbonWise AI is designed to empower you with real data, avoiding generic estimates or mock statistics. Our tools calculate accurate emissions based on recognized sustainability standards and your day-to-day actions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          
          <div className="p-4 bg-neutral-50 rounded-xl border border-gray-100 space-y-1">
            <h5 className="font-bold text-xs text-gray-800">Global Sustainability Network</h5>
            <p className="text-[11px] text-gray-400 leading-normal font-medium">
              Calculations utilize standard regional emissions factors for your specific city to estimate transportation, diet, and utility impact accurately and privately.
            </p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-gray-100 space-y-1">
            <h5 className="font-bold text-xs text-gray-800">Collective Carbon Reduction</h5>
            <p className="text-[11px] text-gray-400 leading-normal font-medium">
              Every logged travel segment, meal, and processed receipt strengthens your personalized metrics, making your sustainability trends more accurate over time.
            </p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-gray-100 space-y-1">
            <div className="flex justify-between items-start gap-1">
              <h5 className="font-bold text-xs text-gray-800">Community Challenges</h5>
              <span className="text-[8px] font-bold uppercase text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">Future Tier</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-normal font-medium">
              As our user community expands, shared collaborative challenges such as "Carpooling Weeks" or "Green Schedule Challenges" will be introduced.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

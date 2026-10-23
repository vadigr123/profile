var __SamNS = ( () => {
    var w = Object.defineProperty;
    var l1 = Object.getOwnPropertyDescriptor;
    var U1 = Object.getOwnPropertyNames;
    var n1 = Object.prototype.hasOwnProperty;
    var N1 = (r, E) => {
        for (var R in E)
            w(r, R, {
                get: E[R],
                enumerable: !0
            })
    }
      , W1 = (r, E, R, H) => {
        if (E && typeof E == "object" || typeof E == "function")
            for (let A of U1(E))
                !n1.call(r, A) && A !== R && w(r, A, {
                    get: () => E[A],
                    enumerable: !(H = l1(E, A)) || H.enumerable
                });
        return r
    }
    ;
    var S1 = r => W1(w({}, "__esModule", {
        value: !0
    }), r);
    var _1 = {};
    N1(_1, {
        default: () => V
    });
    let y = (r, E) => (r & E) != 0
      , F = r => {
        let E = new Uint8Array(r.length);
        return r.split("").forEach( (R, H) => {
            E[H] = R.charCodeAt(0)
        }
        ),
        E
    }
      , v = r => {
        var E = new Uint8Array(4);
        return E[0] = r,
        E[1] = r >> 8,
        E[2] = r >> 16,
        E[3] = r >> 24,
        E
    }
      , g = r => {
        var E = new Uint8Array(2);
        return E[0] = r,
        E[1] = r >> 8,
        E
    }
      , Z = null
      , x = r => {
        let E = new Uint8Array(44 + r.length)
          , R = 0
          , H = A => {
            E.set(A, R),
            R += A.length
        }
        ;
        return H(F("RIFF")),
        H(v(r.length + 12 + 16 + 8 - 8)),
        H(F("WAVE")),
        H(F("fmt ")),
        H(v(16)),
        H(g(1)),
        H(g(1)),
        H(v(22050)),
        H(v(22050)),
        H(g(1)),
        H(g(8)),
        H(F("data")),
        H(v(r.length)),
        H(r),
        E
    }
      , E1 = {
        " ": 0,
        "!": 2,
        '"': 2,
        "#": 2,
        $: 2,
        "%": 2,
        "&": 2,
        "'": 130,
        "(": 0,
        ")": 0,
        "*": 2,
        "+": 2,
        ",": 2,
        "-": 2,
        ".": 2,
        "/": 2,
        0: 3,
        1: 3,
        2: 3,
        3: 3,
        4: 3,
        5: 3,
        6: 3,
        7: 3,
        8: 3,
        9: 3,
        ":": 2,
        ";": 2,
        "<": 2,
        "=": 2,
        ">": 2,
        "?": 2,
        "@": 2,
        A: 192,
        B: 168,
        C: 176,
        D: 172,
        E: 192,
        F: 160,
        G: 184,
        H: 160,
        I: 192,
        J: 188,
        K: 160,
        L: 172,
        M: 168,
        N: 172,
        O: 192,
        P: 160,
        Q: 160,
        R: 172,
        S: 180,
        T: 164,
        U: 192,
        V: 168,
        W: 168,
        X: 176,
        Y: 192,
        Z: 188,
        "[": 0,
        "\\": 0,
        "]": 0,
        "^": 2,
        _: 0,
        "`": 32
    }
      , M = 128
      , c = (r, E) => (E1[r] & E) != 0
      , o = (r, E, R) => c(r[E], R)
      , h = (r, E) => E.indexOf(r) !== -1
      , j = r => {
        let E = r.split("=")
          , R = E.pop()
          , H = E.join("=").split("(")
          , A = H.pop().split(")")
          , O = H[0]
          , e = A[0]
          , t = A[1]
          , U = ["T", "C", "S"]
          , N = ["E", "I", "Y"]
          , S = (W, I, D) => {
            if (W.startsWith(e, I) && ( (l, Y) => {
                for (let a = O.length - 1; -1 < a; a--) {
                    var i = O[a];
                    if (c(i, M)) {
                        if (l[--Y] !== i)
                            return !1
                    } else if (!{
                        " ": () => !o(l, --Y, M),
                        "#": () => o(l, --Y, 64),
                        ".": () => o(l, --Y, 8),
                        "&": () => o(l, --Y, 16) || h(l.substr(--Y, 2), ["CH", "SH"]),
                        "@": () => {
                            var n;
                            return !!o(l, --Y, 4) || (n = l[Y]) === "H" && !!h(n, U)
                        }
                        ,
                        "^": () => o(l, --Y, 32),
                        "+": () => h(l[--Y], N),
                        ":": () => {
                            for (; 0 <= Y && o(l, Y - 1, 32); )
                                Y--;
                            return !0
                        }
                    }[i]())
                        return !1
                }
                return !0
            }
            )(W, I) && ( (l, Y) => {
                for (let a = 0; a < t.length; a++) {
                    var i = t[a];
                    if (c(i, M)) {
                        if (l[++Y] !== i)
                            return !1
                    } else if (!{
                        " ": () => !o(l, ++Y, M),
                        "#": () => o(l, ++Y, 64),
                        ".": () => o(l, ++Y, 8),
                        "&": () => o(l, ++Y, 16) || h(l.substr(++Y - 2, 2), ["HC", "HS"]),
                        "@": () => {
                            var n;
                            return !!o(l, ++Y, 4) || (n = l[Y]) === "H" && !!h(n, U)
                        }
                        ,
                        "^": () => o(l, ++Y, 32),
                        "+": () => h(l[++Y], N),
                        ":": () => {
                            for (; o(l, Y + 1, 32); )
                                Y++;
                            return !0
                        }
                        ,
                        "%": () => {
                            if (l[Y + 1] !== "E")
                                return l.substr(Y + 1, 3) === "ING" && (Y += 3,
                                !0);
                            if (o(l, Y + 2, M)) {
                                if (!h(l[Y + 2], ["R", "S", "D"]))
                                    return l[Y + 2] !== "L" ? l.substr(Y + 2, 3) === "FUL" && (Y += 4,
                                    !0) : l[Y + 3] === "Y" && (Y += 3,
                                    !0);
                                Y += 2
                            } else
                                Y++;
                            return !0
                        }
                    }[i]())
                        return !1
                }
                return !0
            }
            )(W, I + (e.length - 1)))
                return D(R, e.length),
                !0
        }
        ;
        return S.c = e[0],
        S
    }
      , B = {}
      , T1 = (" (A.)=EH4Y. |(A) =AH| (ARE) =AAR| (AR)O=AXR|(AR)#=EH4R| ^(AS)#=EY4S|(A)WA=AX|(AW)=AO5| :(ANY)=EH4NIY|(A)^+#=EY5|#:(ALLY)=ULIY| (AL)#=UL|(AGAIN)=AXGEH4N|#:(AG)E=IHJ|(A)^%=EY|(A)^+:#=AE| :(A)^+ =EY4| (ARR)=AXR|(ARR)=AE4R| ^(AR) =AA5R|(AR)=AA5R|(AIR)=EH4R|(AI)=EY4|(AY)=EY5|(AU)=AO4|#:(AL) =UL|#:(ALS) =ULZ|(ALK)=AO4K|(AL)^=AOL| :(ABLE)=EY4BUL|(ABLE)=AXBUL|(A)VO=EY4|(ANG)+=EY4NJ|(ATARI)=AHTAA4RIY|(A)TOM=AE|(A)TTI=AE| (AT) =AET| (A)T=AH|(A)=AE| (B) =BIY4| (BE)^#=BIH|(BEING)=BIY4IHNX| (BOTH) =BOW4TH| (BUS)#=BIH4Z|(BREAK)=BREY5K|(BUIL)=BIH4L|(B)=B| (C) =SIY4| (CH)^=K|^E(CH)=K|(CHA)R#=KEH5|(CH)=CH| S(CI)#=SAY4|(CI)A=SH|(CI)O=SH|(CI)EN=SH|(CITY)=SIHTIY|(C)+=S|(CK)=K|(COMMODORE)=KAA4MAHDOHR|(COM)=KAHM|(CUIT)=KIHT|(CREA)=KRIYEY|(C)=K| (D) =DIY4| (DR.) =DAA4KTER|#:(DED) =DIHD|.E(D) =D|#:^E(D) =T| (DE)^#=DIH| (DO) =DUW| (DOES)=DAHZ|(DONE) =DAH5N|(DOING)=DUW4IHNX| (DOW)=DAW|#(DU)A=JUW|#(DU)^#=JAX|(D)=D| (E) =IYIY4|#:(E) =|':^(E) =| :(E) =IY|#(ED) =D|#:(E)D =|(EV)ER=EH4V|(E)^%=IY4|(ERI)#=IY4RIY|(ERI)=EH4RIH|#:(ER)#=ER|(ERROR)=EH4ROHR|(ERASE)=IHREY5S|(ER)#=EHR|(ER)=ER| (EVEN)=IYVEHN|#:(E)W=|@(EW)=UW|(EW)=YUW|(E)O=IY|#:&(ES) =IHZ|#:(E)S =|#:(ELY) =LIY|#:(EMENT)=MEHNT|(EFUL)=FUHL|(EE)=IY4|(EARN)=ER5N| (EAR)^=ER5|(EAD)=EHD|#:(EA) =IYAX|(EA)SU=EH5|(EA)=IY5|(EIGH)=EY4|(EI)=IY4| (EYE)=AY4|(EY)=IY|(EU)=YUW5|(EQUAL)=IY4KWUL|(E)=EH| (F) =EH4F|(FUL)=FUHL|(FRIEND)=FREH5ND|(FATHER)=FAA4DHER|(F)F=|(F)=F| (G) =JIY4|(GIV)=GIH5V| (G)I^=G|(GE)T=GEH5|SU(GGES)=GJEH4S|(GG)=G| B#(G)=G|(G)+=J|(GREAT)=GREY4T|(GON)E=GAO5N|#(GH)=| (GN)=N|(G)=G| (H) =EY4CH| (HAV)=/HAE6V| (HERE)=/HIYR| (HOUR)=AW5ER|(HOW)=/HAW|(H)#=/H|(H)=| (IN)=IHN| (I) =AY4|(I) =AY|(IN)D=AY5N|SEM(I)=IY| ANT(I)=AY|(IER)=IYER|#:R(IED) =IYD|(IED) =AY5D|(IEN)=IYEHN|(IE)T=AY4EH|(I')=AY5| :(I)^%=AY5| :(IE) =AY4|(I)%=IY|(IE)=IY4| (IDEA)=AYDIY5AH|(I)^+:#=IH|(IR)#=AYR|(IZ)%=AYZ|(IS)%=AYZ|I^(I)^#=IH|+^(I)^+=AY|#:^(I)^+=IH|(I)^+=AY|(IR)=ER|(IGH)=AY4|(ILD)=AY5LD| (IGN)=IHGN|(IGN) =AY4N|(IGN)^=AY4N|(IGN)%=AY4N|(ICRO)=AY4KROH|(IQUE)=IY4K|(I)=IH| (J) =JEY4|(J)=J| (K) =KEY4| (K)N=|(K)=K| (L) =EH4L|(LO)C#=LOW|L(L)=|#:^(L)%=UL|(LEAD)=LIYD| (LAUGH)=LAE4F|(L)=L| (M) =EH4M| (MR.) =MIH4STER| (MS.)=MIH5Z| (MRS.) =MIH4SIXZ|(MOV)=MUW4V|(MACHIN)=MAHSHIY5N|M(M)=|(M)=M| (N) =EH4N|E(NG)+=NJ|(NG)R=NXG|(NG)#=NXG|(NGL)%=NXGUL|(NG)=NX|(NK)=NXK| (NOW) =NAW4|N(N)=|(NON)E=NAH4N|(N)=N| (O) =OH4W|(OF) =AHV| (OH) =OW5|(OROUGH)=ER4OW|#:(OR) =ER|#:(ORS) =ERZ|(OR)=AOR| (ONE)=WAHN|#(ONE) =WAHN|(OW)=OW| (OVER)=OW5VER|PR(O)V=UW4|(OV)=AH4V|(O)^%=OW5|(O)^EN=OW|(O)^I#=OW5|(OL)D=OW4L|(OUGHT)=AO5T|(OUGH)=AH5F| (OU)=AW|H(OU)S#=AW4|(OUS)=AXS|(OUR)=OHR|(OULD)=UH5D|(OU)^L=AH5|(OUP)=UW5P|(OU)=AW|(OY)=OY|(OING)=OW4IHNX|(OI)=OY5|(OOR)=OH5R|(OOK)=UH5K|F(OOD)=UW5D|L(OOD)=AH5D|M(OOD)=UW5D|(OOD)=UH5D|F(OOT)=UH5T|(OO)=UW5|(O')=OH|(O)E=OW|(O) =OW|(OA)=OW4| (ONLY)=OW4NLIY| (ONCE)=WAH4NS|(ON'T)=OW4NT|C(O)N=AA|(O)NG=AO| :^(O)N=AH|I(ON)=UN|#:(ON)=UN|#^(ON)=UN|(O)ST=OW|(OF)^=AO4F|(OTHER)=AH5DHER|R(O)B=RAA|^R(O):#=OW5|(OSS) =AO5S|#:^(OM)=AHM|(O)=AA| (P) =PIY4|(PH)=F|(PEOPL)=PIY5PUL|(POW)=PAW4|(PUT) =PUHT|(P)P=|(P)S=|(P)N=|(PROF.)=PROHFEH4SER|(P)=P| (Q) =KYUW4|(QUAR)=KWOH5R|(QU)=KW|(Q)=K| (R) =AA5R| (RE)^#=RIY|(R)R=|(R)=R| (S) =EH4S|(SH)=SH|#(SION)=ZHUN|(SOME)=SAHM|#(SUR)#=ZHER|(SUR)#=SHER|#(SU)#=ZHUW|#(SSU)#=SHUW|#(SED)=ZD|#(S)#=Z|(SAID)=SEHD|^(SION)=SHUN|(S)S=|.(S) =Z|#:.E(S) =Z|#:^#(S) =S|U(S) =S| :#(S) =Z|##(S) =Z| (SCH)=SK|(S)C+=|#(SM)=ZUM|#(SN)'=ZUM|(STLE)=SUL|(S)=S| (T) =TIY4| (THE) #=DHIY| (THE) =DHAX|(TO) =TUX| (THAT)=DHAET| (THIS) =DHIHS| (THEY)=DHEY| (THERE)=DHEHR|(THER)=DHER|(THEIR)=DHEHR| (THAN) =DHAEN| (THEM) =DHAEN|(THESE) =DHIYZ| (THEN)=DHEHN|(THROUGH)=THRUW4|(THOSE)=DHOHZ|(THOUGH) =DHOW|(TODAY)=TUXDEY|(TOMO)RROW=TUMAA5|(TO)TAL=TOW5| (THUS)=DHAH4S|(TH)=TH|#:(TED)=TIXD|S(TI)#N=CH|(TI)O=SH|(TI)A=SH|(TIEN)=SHUN|(TUR)#=CHER|(TU)A=CHUW| (TWO)=TUW|&(T)EN =|(T)=T| (U) =YUW4| (UN)I=YUWN| (UN)=AHN| (UPON)=AXPAON|@(UR)#=UH4R|(UR)#=YUH4R|(UR)=ER|(U)^ =AH|(U)^^=AH5|(UY)=AY5| G(U)#=|G(U)%=|G(U)#=W|#N(U)=YUW|@(U)=UW|(U)=YUW| (V) =VIY4|(VIEW)=VYUW5|(V)=V| (W) =DAH4BULYUW| (WERE)=WER|(WA)SH=WAA|(WA)ST=WEY|(WA)S=WAH|(WA)T=WAA|(WHERE)=WHEHR|(WHAT)=WHAHT|(WHOL)=/HOWL|(WHO)=/HUW|(WH)=WH|(WAR)#=WEHR|(WAR)=WAOR|(WOR)^=WER|(WR)=R|(WOM)A=WUHM|(WOM)E=WIHM|(WEA)R=WEH|(WANT)=WAA5NT|ANS(WER)=ER|(W)=W| (X) =EH4KR| (X)=Z|(X)=KS| (Y) =WAY4|(YOUNG)=YAHNX| (YOUR)=YOHR| (YOU)=YUW| (YES)=YEHS| (Y)=Y|F(Y)=AY|PS(YCH)=AYK|#:^(Y)=IY|#:^(Y)I=IY| :(Y) =AY| :(Y)#=AY| :(Y)^+:#=IH| :(Y)^#=AY|(Y)=IH| (Z) =ZIY4|(Z)=Z".split("|").map(r => {
        var E = (r = j(r)).c;
        B[E] = B[E] || [],
        B[E].push(r)
    }
    ),
    `(A)=|(!)=.|(") =-AH5NKWOWT-|(")=KWOW4T-|(#)= NAH4MBER|($)= DAA4LER|(%)= PERSEH4NT|(&)= AEND|(')=|(*)= AE4STERIHSK|(+)= PLAH4S|(,)=,| (-) =-|(-)=|(.)= POYNT|(/)= SLAE4SH|(0)= ZIY4ROW| (1ST)=FER4ST| (10TH)=TEH4NTH|(1)= WAH4N| (2ND)=SEH4KUND|(2)= TUW4| (3RD)=THER4D|(3)= THRIY4|(4)= FOH4R| (5TH)=FIH4FTH|(5)= FAY4V| (64) =SIH4KSTIY FOHR|(6)= SIH4KS|(7)= SEH4VUN| (8TH)=EY4TH|(8)= EY4T|(9)= NAY4N|(:)=.|(;)=.|(<)= LEH4S DHAEN|(=)= IY4KWULZ|(>)= GREY4TER DHAEN|(?)=?|(@)= AE6T|(^)= KAE4RIXT`.split("|").map(j))
      , _ = "*12345678".split("")
      , A1 = " *.*?*,*-*IYIHEHAEAAAHAOUHAXIXERUXOHRXLXWXYXWHR*L*W*Y*M*N*NXDXQ*S*SHF*TH/H/XZ*ZHV*DHCH**J*******EYAYOYAWOWUWB*****D*****G*****GX****P*****T*****K*****KX****ULUMUN".match(/.{1,2}/g)
      , t1 = [32768, 49408, 49408, 49408, 49408, 164, 164, 164, 164, 164, 164, 132, 132, 164, 164, 132, 132, 132, 132, 132, 132, 132, 68, 4164, 4164, 4164, 4164, 2124, 3148, 2124, 1096, 16460, 9280, 8256, 8256, 9280, 64, 64, 9284, 8260, 8260, 9284, 8264, 8256, 76, 8260, 0, 0, 180, 180, 180, 148, 148, 148, 78, 78, 78, 1102, 1102, 1102, 78, 78, 78, 78, 78, 78, 75, 75, 75, 1099, 1099, 1099, 75, 75, 75, 75, 75, 75, 128, 193, 193]
      , b = [0, 4626, 4626, 4626, 2056, 2824, 2312, 2824, 3592, 3851, 2822, 4108, 3082, 1541, 1541, 3595, 3082, 3594, 3082, 2825, 2056, 2055, 2825, 2567, 2310, 2056, 2054, 2055, 2055, 2055, 770, 1285, 514, 514, 514, 514, 514, 514, 1542, 1542, 2055, 1542, 1542, 514, 2312, 1027, 513, 286, 3597, 3852, 3852, 3852, 3598, 3593, 2054, 513, 514, 1797, 513, 257, 1798, 513, 514, 1798, 513, 514, 2056, 514, 514, 1540, 514, 514, 1798, 513, 1028, 1798, 257, 1028, 1479, 1535]
      , f1 = (r, E) => {
        var R = A1.findIndex(H => H === r + E && H[1] !== "*");
        return R !== -1 && R
    }
      , D1 = r => {
        var E = A1.findIndex(R => R === r + "*");
        return E !== -1 && E
    }
      , i1 = (r, E, R) => {
        for (let H = 0; H < r.length; H++) {
            let A = r[H], O = r[H + 1] || "", e;
            if ((e = f1(A, O)) !== !1)
                H++,
                E(e);
            else if ((e = D1(A)) !== !1)
                E(e);
            else {
                for (e = _.length; A !== _[e] && 0 < e; )
                    --e;
                if (e === 0)
                    throw Error();
                R(e)
            }
        }
    }
      , T = (r, E) => y(t1[r], E)
      , a1 = 23
      , o1 = 57
      , u1 = 69
      , L1 = 1
      , s1 = 2
      , G1 = 8192
      , h1 = 4096
      , M1 = 2048
      , K1 = 1024
      , C1 = 256
      , L = 128
      , p = 64
      , m = 32
      , v1 = 16
      , X1 = 8
      , $ = 4
      , X = 2
      , d = 1
      , c1 = (r, E, R, H) => {
        let A = (S, W) => {
            switch (S) {
            case 53:
                T(R(W - 1), K1) && E(W, 16);
                break;
            case 42:
                r(W + 1, 43, H(W));
                break;
            case 44:
                r(W + 1, 45, H(W))
            }
        }
        , O = (S, W) => {
            E(S, 13),
            r(S + 1, W, H(S))
        }
        , e = -1, t;
        for (; (t = R(++e)) !== null; )
            if (t !== 0)
                if (T(t, v1))
                    r(e + 1, T(t, m) ? 21 : 20, H(e)),
                    A(t, e);
                else if (t === 78)
                    O(e, 24);
                else if (t === 79)
                    O(e, 27);
                else if (t === 80)
                    O(e, 28);
                else if (T(t, L) && H(e))
                    R(e + 1) === 0 && (t = R(e + 2)) !== null && T(t, L) && H(e + 2) && r(e + 2, 31, 0);
                else {
                    var U, N = e === 0 ? null : R(e - 1);
                    if (t === a1)
                        switch (N) {
                        case u1:
                            E(e - 1, 42);
                            break;
                        case o1:
                            E(e - 1, 44);
                            break;
                        default:
                            T(N, L) && E(e, 18)
                        }
                    else
                        t === 24 && T(N, L) ? E(e, 19) : N === 60 && t === 32 ? E(e, 38) : t === 60 ? (U = R(e + 1),
                        T(U, m) || U === null || E(e, 63)) : (t === 72 && (U = R(e + 1),
                        T(U, m) && U !== null || (E(e, 75),
                        t = 75)),
                        T(t, d) && N === 32 ? E(e, t - 12) : T(t, d) || A(t, e),
                        t !== 69 && t !== 57 || 0 < e && T(R(e - 1), L) && ((t = R(e + 1)) === 0 && (t = R(e + 2)),
                        T(t, L)) && !H(e + 1) && E(e, 30))
                }
    }
      , d1 = (r, E, R) => {
        for (let t = 0; r(t) !== null; t++)
            if (T(r(t), C1)) {
                for (var H, A = t; 1 < --t && !T(r(t), L); )
                    ;
                if (t === 0)
                    break;
                for (; t < A; t++)
                    T(r(t), G1) && !T(r(t), $) || (H = R(t),
                    E(t, (H >> 1) + H + 1))
            }
        let O = -1, e;
        for (; (e = r(++O)) !== null; ) {
            let t = O, U, N, S;
            if (T(e, L))
                e = r(++t),
                T(e, p) ? (U = e === null ? p | d : t1[e],
                y(U, $) ? (S = R(O),
                E(O, (S >> 2) + S + 1)) : y(U, d) && (N = R(O),
                E(O, N - (N >> 3)))) : e !== 18 && e !== 19 || !T(r(++t), p) || E(O, R(O) - 1);
            else if (T(e, M1))
                (e = r(++t)) !== null && T(e, X) && (E(t, 6),
                E(t - 1, 5));
            else if (T(e, X)) {
                for (; (e = r(++t)) === 0; )
                    ;
                e !== null && T(e, X) && (E(t, 1 + (R(t) >> 1)),
                E(O, 1 + (R(O) >> 1)))
            } else
                0 < t && T(e, h1) && T(r(t - 1), X) && E(t, R(t) - 2)
        }
    }
      , F1 = (r, E, R) => {
        let H = 0;
        for (var A; (A = r(H)) !== null; )
            T(A, p) && (A = r(H + 1)) !== null && T(A, L) && (A = E(H + 1)) !== 0 && A < 128 && R(H, A + 1),
            ++H
    }
      , g1 = (r, E, R) => {
        let H = 0;
        for (var A; (A = r(H)) !== null; ) {
            var O = E(H);
            R(H, O === 0 || 127 < O ? 255 & b[A] : b[A] >> 8),
            H++
        }
    }
      , Z1 = (r, E, R) => {
        let H = -1;
        for (var A; (A = r(++H)) !== null; )
            if (T(A, X)) {
                if (T(A, d)) {
                    let O, e = H;
                    for (; (O = r(++e)) === 0; )
                        ;
                    if (O !== null && (T(O, X1) || O === 36 || O === 37))
                        continue
                }
                E(H + 1, A + 1, R(H), 255 & b[A + 1]),
                E(H + 2, A + 2, R(H), 255 & b[A + 2]),
                H += 2
            }
    }
      , P1 = [24, 26, 23, 23, 23]
      , B1 = [0, 224, 230, 236, 243, 249, 0, 6, 12, 6]
      , q = [0, 31, 31, 31, 31, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 2, 10, 2, 8, 5, 5, 11, 10, 9, 8, 8, 160, 8, 8, 23, 31, 18, 18, 18, 18, 30, 30, 20, 20, 20, 20, 23, 23, 26, 26, 29, 29, 2, 2, 2, 2, 2, 2, 26, 29, 27, 26, 29, 27, 26, 29, 27, 26, 29, 27, 23, 29, 23, 23, 29, 23, 23, 29, 23, 23, 29, 23, 23, 23]
      , P = [0, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 2, 4, 4, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 0, 1, 0, 1, 0, 5, 5, 5, 5, 5, 4, 4, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 2, 2, 0, 1, 3, 0, 2, 3, 0, 2, 160, 160]
      , z = [0, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 4, 4, 3, 3, 3, 3, 3, 1, 2, 3, 2, 1, 3, 3, 3, 3, 1, 1, 3, 3, 3, 2, 2, 3, 2, 3, 0, 0, 5, 5, 5, 5, 4, 4, 2, 0, 2, 2, 0, 3, 2, 0, 4, 2, 0, 3, 2, 0, 2, 2, 0, 2, 3, 0, 3, 3, 0, 3, 176, 160]
      , p1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 241, 226, 211, 187, 124, 149, 1, 2, 3, 3, 0, 114, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 27, 0, 0, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      , V1 = [0, 5980947, 5980947, 5980947, 5980947, 7230474, 6113550, 5980947, 5783320, 5842971, 5712919, 5775125, 5383440, 5844244, 6113550, 4075794, 5383182, 5774866, 4076306, 7218448, 5250317, 6112527, 5904395, 3944978, 7216654, 5904395, 7230217, 5320198, 7943686, 6641158, 7943686, 5980945, 6506758, 6967046, 5315078, 7946758, 6113550, 5383440, 6107913, 6767114, 4990984, 6106890, 6639366, 6639366, 7946758, 6639365, 7958022, 0, 5916691, 5777179, 5775125, 5778203, 5774866, 5382669, 5315078, 5315078, 5315078, 7946758, 7946758, 7946758, 7368198, 7237126, 7237126, 6181894, 6181894, 6181894, 5315078, 5315078, 5315078, 7946758, 7946758, 7946758, 6647046, 6641162, 7367946, 6181894, 6181894, 6181894, 556844, 98067]
      , J = [0, 0, 0, 0, 0, 526861, 461581, 527630, 527887, 68879, 68623, 3087, 68367, 2316, 461581, 330508, 68623, 3087, 396301, 67597, 2061, 461838, 2061, 330252, 67597, 2061, 526861, 780, 2313, 198153, 0, 0, 0, 0, 0, 0, 0, 0, 779, 66827, 779, 1035, 0, 0, 1, 66827, 920064, 66050, 593422, 68879, 3087, 68879, 3087, 2061, 2, 260, 0, 2, 260, 0, 1, 260, 0, 1, 260, 0, 0, 0, 0, 0, 0, 0, 0, 461324, 0, 0, 330240, 0, 1245199, 1048591]
      , b1 = [56, 132, 107, 25, 198, 99, 24, 134, 115, 152, 198, 177, 28, 202, 49, 140, 199, 49, 136, 194, 48, 152, 70, 49, 24, 198, 53, 12, 202, 49, 12, 198, 33, 16, 36, 105, 18, 194, 49, 20, 196, 113, 8, 74, 34, 73, 171, 106, 168, 172, 73, 81, 50, 213, 82, 136, 147, 108, 148, 34, 21, 84, 210, 37, 150, 212, 80, 165, 70, 33, 8, 133, 107, 24, 196, 99, 16, 206, 107, 24, 140, 113, 25, 140, 99, 53, 12, 198, 51, 153, 204, 108, 181, 78, 162, 153, 70, 33, 40, 130, 149, 46, 227, 48, 156, 197, 48, 156, 162, 177, 156, 103, 49, 136, 102, 89, 44, 83, 24, 132, 103, 80, 202, 227, 10, 172, 171, 48, 172, 98, 48, 140, 99, 16, 148, 98, 177, 140, 130, 40, 150, 51, 152, 214, 181, 76, 98, 41, 165, 74, 181, 156, 198, 49, 20, 214, 56, 156, 75, 180, 134, 101, 24, 174, 103, 28, 166, 99, 25, 150, 35, 25, 132, 19, 8, 166, 82, 172, 202, 34, 137, 110, 171, 25, 140, 98, 52, 196, 98, 25, 134, 99, 24, 196, 35, 88, 214, 163, 80, 66, 84, 74, 173, 74, 37, 17, 107, 100, 137, 74, 99, 57, 138, 35, 49, 42, 234, 162, 169, 68, 197, 18, 205, 66, 52, 140, 98, 24, 140, 99, 17, 72, 102, 49, 157, 68, 51, 29, 70, 49, 156, 198, 177, 12, 205, 50, 136, 196, 115, 24, 134, 115, 8, 214, 99, 88, 7, 129, 224, 240, 60, 7, 135, 144, 60, 124, 15, 199, 192, 192, 240, 124, 30, 7, 128, 128, 0, 28, 120, 112, 241, 199, 31, 192, 12, 254, 28, 31, 31, 14, 10, 122, 192, 113, 242, 131, 143, 3, 15, 15, 12, 0, 121, 248, 97, 224, 67, 15, 131, 231, 24, 249, 193, 19, 218, 233, 99, 143, 15, 131, 131, 135, 195, 31, 60, 112, 240, 225, 225, 227, 135, 184, 113, 14, 32, 227, 141, 72, 120, 28, 147, 135, 48, 225, 193, 193, 228, 120, 33, 131, 131, 195, 135, 6, 57, 229, 195, 135, 7, 14, 28, 28, 112, 244, 113, 156, 96, 54, 50, 195, 30, 60, 243, 143, 14, 60, 112, 227, 199, 143, 15, 15, 14, 60, 120, 240, 227, 135, 6, 240, 227, 7, 193, 153, 135, 15, 24, 120, 112, 112, 252, 243, 16, 177, 140, 140, 49, 124, 112, 225, 134, 60, 100, 108, 176, 225, 227, 15, 35, 143, 15, 30, 62, 56, 60, 56, 123, 143, 7, 14, 60, 244, 23, 30, 60, 120, 242, 158, 114, 73, 227, 37, 54, 56, 88, 57, 226, 222, 60, 120, 120, 225, 199, 97, 225, 225, 176, 240, 240, 195, 199, 14, 56, 192, 240, 206, 115, 115, 24, 52, 176, 225, 199, 142, 28, 60, 248, 56, 240, 225, 193, 139, 134, 143, 28, 120, 112, 240, 120, 172, 177, 143, 57, 49, 219, 56, 97, 195, 14, 14, 56, 120, 115, 23, 30, 57, 30, 56, 100, 225, 241, 193, 78, 15, 64, 162, 2, 197, 143, 129, 161, 252, 18, 8, 100, 224, 60, 34, 224, 69, 7, 142, 12, 50, 144, 240, 31, 32, 73, 224, 248, 12, 96, 240, 23, 26, 65, 170, 164, 208, 141, 18, 130, 30, 30, 3, 248, 62, 3, 12, 115, 128, 112, 68, 38, 3, 36, 225, 62, 4, 78, 4, 28, 193, 9, 204, 158, 144, 33, 7, 144, 67, 100, 192, 15, 198, 144, 156, 193, 91, 3, 226, 29, 129, 224, 94, 29, 3, 132, 184, 44, 15, 128, 177, 131, 224, 48, 65, 30, 67, 137, 131, 80, 252, 36, 46, 19, 131, 241, 124, 76, 44, 201, 13, 131, 176, 181, 130, 228, 232, 6, 156, 7, 160, 153, 29, 7, 62, 130, 143, 112, 48, 116, 64, 202, 16, 228, 232, 15, 146, 20, 63, 6, 248, 132, 136, 67, 129, 10, 52, 57, 65, 198, 227, 28, 71, 3, 176, 184, 19, 10, 194, 100, 248, 24, 249, 96, 179, 192, 101, 32, 96, 166, 140, 195, 129, 32, 48, 38, 30, 28, 56, 211, 1, 176, 38, 64, 244, 11, 195, 66, 31, 133, 50, 38, 96, 64, 201, 203, 1, 236, 17, 40, 64, 250, 4, 52, 224, 112, 76, 140, 29, 7, 105, 3, 22, 200, 4, 35, 232, 198, 154, 11, 26, 3, 224, 118, 6, 5, 207, 30, 188, 88, 49, 113, 102, 0, 248, 63, 4, 252, 12, 116, 39, 138, 128, 113, 194, 58, 38, 6, 192, 31, 5, 15, 152, 64, 174, 1, 127, 192, 7, 255, 0, 14, 254, 0, 3, 223, 128, 3, 239, 128, 27, 241, 194, 0, 231, 224, 24, 252, 224, 33, 252, 128, 60, 252, 64, 14, 126, 0, 63, 62, 0, 15, 254, 0, 31, 255, 0, 62, 240, 7, 252, 0, 126, 16, 63, 255, 0, 63, 56, 14, 124, 1, 135, 12, 252, 199, 0, 62, 4, 15, 62, 31, 15, 15, 31, 15, 2, 131, 135, 207, 3, 135, 15, 63, 192, 7, 158, 96, 63, 192, 3, 254, 0, 63, 224, 119, 225, 192, 254, 224, 195, 224, 1, 223, 248, 3, 7, 0, 126, 112, 0, 124, 56, 24, 254, 12, 30, 120, 28, 124, 62, 14, 31, 30, 30, 62, 0, 127, 131, 7, 219, 135, 131, 7, 199, 7, 16, 113, 255, 0, 63, 226, 1, 224, 193, 195, 225, 0, 127, 192, 5, 240, 32, 248, 240, 112, 254, 120, 121, 248, 2, 63, 12, 143, 3, 15, 159, 224, 193, 199, 135, 3, 195, 195, 176, 225, 225, 193, 227, 224, 113, 240, 0, 252, 112, 124, 12, 62, 56, 14, 28, 112, 195, 199, 3, 129, 193, 199, 231, 0, 15, 199, 135, 25, 9, 239, 196, 51, 224, 193, 252, 248, 112, 240, 120, 248, 240, 97, 199, 0, 31, 248, 1, 124, 248, 240, 120, 112, 60, 124, 206, 14, 33, 131, 207, 8, 7, 143, 8, 193, 135, 143, 128, 199, 227, 0, 7, 248, 224, 239, 0, 57, 247, 128, 14, 248, 225, 227, 248, 33, 159, 192, 255, 3, 248, 7, 192, 31, 248, 196, 4, 252, 196, 193, 188, 135, 240, 15, 192, 127, 5, 224, 37, 236, 192, 62, 132, 71, 240, 142, 3, 248, 3, 251, 192, 25, 248, 7, 156, 12, 23, 248, 7, 224, 31, 161, 252, 15, 252, 1, 240, 63, 0, 254, 3, 240, 31, 0, 253, 0, 255, 136, 13, 249, 1, 255, 0, 112, 7, 192, 62, 66, 243, 13, 196, 127, 128, 252, 7, 240, 94, 192, 63, 0, 120, 63, 129, 255, 1, 248, 1, 195, 232, 12, 228, 100, 143, 228, 15, 240, 7, 240, 194, 31, 0, 127, 192, 111, 128, 126, 3, 248, 7, 240, 63, 192, 120, 15, 130, 7, 254, 34, 119, 112, 2, 118, 3, 254, 0, 254, 103, 0, 124, 199, 241, 142, 198, 59, 224, 63, 132, 243, 25, 216, 3, 153, 252, 9, 184, 15, 248, 0, 157, 36, 97, 249, 13, 0, 253, 3, 240, 31, 144, 63, 1, 248, 31, 208, 15, 248, 55, 1, 248, 7, 240, 15, 192, 63, 0, 254, 3, 248, 15, 192, 63, 0, 250, 3, 240, 15, 128, 255, 1, 184, 7, 240, 1, 252, 1, 188, 128, 19, 30, 0, 127, 225, 64, 127, 160, 127, 176, 0, 63, 192, 31, 192, 56, 15, 240, 31, 128, 255, 1, 252, 3, 241, 126, 1, 254, 1, 240, 255, 0, 127, 192, 29, 7, 240, 15, 192, 126, 6, 224, 7, 224, 15, 248, 6, 193, 254, 1, 252, 3, 224, 15, 0, 252]
      , w1 = (r, E) => {
        let R = (A, O) => (A * O >> 8 & 255) << 1
          , H = [[], [], []];
        V1.map( (A, O) => {
            H[0][O] = 255 & A,
            H[1][O] = A >> 8 & 255,
            H[2][O] = A >> 16 & 255
        }
        );
        for (let A = 5; A < 30; A++)
            H[0][A] = R(r, H[0][A]),
            H[1][A] = R(E, H[1][A]);
        for (let A = 48; A < 54; A++)
            H[0][A] = R(r, H[0][A]),
            H[1][A] = R(E, H[1][A]);
        return H
    }
      , m1 = (r, E, R, H) => {
        let A = [r, E[0], E[1], E[2], R[0], R[1], R[2]], O = (n, f) => A[n][f], e = (n, f, G, s) => {
            let u = s < 0
              , K = Math.abs(s) % n
              , k = s / n | 0
              , Q = 0
              , Y1 = n;
            for (; 0 < --Y1; ) {
                let C = O(f, G) + k;
                (Q += K) >= n && (Q -= n,
                u ? C-- : C && C++),
                A[f][++G] = C,
                C += k
            }
        }
        , t, U, N = 0;
        for (let n = 0; n < H.length - 1; n++) {
            var S = H[n][0]
              , W = H[n + 1][0]
              , I = q[W]
              , D = q[S]
              , l = (U = D === I ? (t = P[S],
            P[W]) : D < I ? (t = z[W],
            P[W]) : (t = P[S],
            z[S]),
            (N += H[n][1]) + U)
              , Y = N - t
              , i = t + U;
            if ((i - 2 & 128) == 0) {
                e((D = H[n][1] >> 1) + (I = H[n + 1][1] >> 1), 0, Y, r[N + I] - r[N - D]);
                for (let f = 1; f < 7; f++) {
                    var a = O(f, l) - O(f, Y);
                    e(i, f, Y, a)
                }
            }
        }
        return N + H[H.length - 1][1]
    }
      , J1 = 255
      , y1 = 1
      , k1 = (r, E, R) => {
        let H = (W, I, D) => {
            var l = I;
            I < 30 ? I = 0 : I -= 30;
            let Y;
            for (; (Y = D[I]) === 127; )
                ++I;
            for (; I !== l; )
                for (Y += W,
                D[I] = 255 & Y; ++I !== l && D[I] === 255; )
                    ;
        }
          , A = []
          , O = [[], [], []]
          , e = [[], [], []]
          , t = []
          , U = 0;
        for (let W = 0; W < E.length; W++) {
            var N = E[W][0]
              , S = (N === L1 ? H(y1, U, A) : N === s1 && H(J1, U, A),
            B1[E[W][2]]);
            for (let I = E[W][1]; 0 < I; I--)
                O[0][U] = R[0][N],
                O[1][U] = R[1][N],
                O[2][U] = R[2][N],
                e[0][U] = 255 & J[N],
                e[1][U] = J[N] >> 8 & 255,
                e[2][U] = J[N] >> 16 & 255,
                t[U] = p1[N],
                A[U] = r + S & 255,
                U++
        }
        return [A, O, e, t]
    }
      , Q1 = (r, S, O, N, A) => {
        var O = w1(O, N)
          , [e,t,U,N] = k1(S, r, O)
          , S = m1(e, t, U, r);
        if (!A)
            for (let I = 0; I < e.length; I++)
                e[I] -= t[0][I] >> 1;
        var W = [0, 1, 2, 2, 2, 3, 3, 4, 4, 5, 6, 8, 9, 11, 13, 15];
        for (let I = U[0].length - 1; 0 <= I; I--)
            U[0][I] = W[U[0][I]],
            U[1][I] = W[U[1][I]],
            U[2][I] = W[U[2][I]];
        return [S, t, e, U, N]
    }
      , x1 = r => {
        let E = new Uint8Array(r)
          , R = 0
          , H = 0
          , A = (O, e) => {
            e = 16 * (15 & e),
            A.ary(O, [e, e, e, e, e])
        }
        ;
        return A.ary = (O, e) => {
            if (((R += [[162, 167, 167, 127, 128], [226, 60, 60, 0, 0], [225, 60, 59, 0, 0], [200, 0, 0, 54, 55], [199, 0, 0, 54, 54]][H][O]) / 50 | 0) > E.length)
                throw new Error;
            H = O;
            for (let t = 0; t < 5; t++)
                E[(R / 50 | 0) + t] = e[t]
        }
        ,
        A.get = () => E.slice(0, R / 50 | 0),
        A
    }
      , H1 = (r, E, R, H) => {
        let A = (7 & R) - 1
          , O = 256 * A & 65535
          , e = 248 & R
          , t = (N, S, W, I) => {
            let D = 8
              , l = b1[O + e];
            for (; (128 & l) != 0 ? r(N, S) : r(W, I),
            l <<= 1,
            --D; )
                ;
        }
        ;
        if (e === 0) {
            let N = H >> 4 ^ 255;
            for (e = 255 & E; t(3, 26, 4, 6),
            e++,
            e &= 255,
            255 & ++N; )
                ;
            return e
        }
        e ^= 255;
        for (var U = 255 & P1[A]; t(2, 5, 1, U),
        255 & ++e; )
            ;
        return E
    }
      , e1 = r => 127 * Math.sin(2 * Math.PI * (r / 256)) | 0
      , j1 = (r, E, R, H, A, O, e) => {
        let t = R
          , U = 0
          , N = 0
          , S = 0
          , W = 0
          , I = 0
          , D = A[0]
          , l = .75 * D | 0;
        for (; E; ) {
            var Y = e[I];
            if ((248 & Y) != 0)
                W = H1(r, W, Y, A[255 & I]),
                I += 2,
                E -= 2,
                t = R;
            else {
                {
                    let f = []
                      , G = 256 * U
                      , s = 256 * N
                      , u = 256 * S;
                    for (let K = 0; K < 5; K++) {
                        var n = e1(255 & G >> 8)
                          , i = e1(255 & s >> 8)
                          , a = (255 & u >> 8) < 129 ? -112 : 112
                          , n = (n * (15 & O[0][I]) + i * (15 & O[1][I]) + a * (15 & O[2][I])) / 32 + 128;
                        f[K] = 0 | n,
                        G += 256 * H[0][I] / 4,
                        s += 256 * H[1][I] / 4,
                        u += 256 * H[2][I] / 4
                    }
                    r.ary(0, f)
                }
                if (--t == 0) {
                    if (I++,
                    --E == 0)
                        return;
                    t = R
                }
                if (--D != 0) {
                    if (--l != 0 || Y === 0) {
                        U += H[0][I],
                        N += H[1][I],
                        S += H[2][I];
                        continue
                    }
                    W = H1(r, W, Y, A[255 & I])
                }
            }
            D = A[I],
            l = .75 * D | 0,
            U = 0,
            N = 0,
            S = 0
        }
    }
    ;
    function r1(t) {
        var E, R, H, A, O, e = 1 < arguments.length && arguments[1] !== void 0 ? arguments[1] : {}, t = (U => {
            if (!U)
                return !1;
            let N = n => n === i.length ? null : i[n]
              , S = (n, f, G, s) => {
                for (let u = i.length - 1; u >= n; u--)
                    i[u + 1] = i[u],
                    Y[u + 1] = I(u),
                    l[u + 1] = W(u);
                i[n] = f,
                Y[n] = 0 | s,
                l[n] = G
            }
              , W = n => 0 | l[n]
              , I = n => 0 | Y[n]
              , D = (n, f) => {
                Y[n] = f
            }
              , l = []
              , Y = []
              , i = []
              , a = 0;
            return i1(U, n => {
                l[a] = 0,
                Y[a] = 0,
                i[a++] = n
            }
            , n => {
                l[a - 1] = n
            }
            ),
            c1(S, (n, f) => {
                i[n] = f
            }
            , N, W),
            F1(N, W, (n, f) => {
                l[n] = f
            }
            ),
            g1(N, W, D),
            d1(N, D, I),
            Z1(N, S, W),
            i.map( (n, f) => n ? [n, 0 | Y[f], 0 | l[f]] : null).filter(n => n)
        }
        )(t);
        return t !== !1 && (A = (A = e.pitch) === void 0 ? 64 : 255 & A,
        R = (R = e.mouth) === void 0 ? 128 : 255 & R,
        H = (H = e.throat) === void 0 ? 128 : 255 & H,
        E = 255 & (e.speed || 72),
        e = e.singmode || !1,
        A = Q1(t, A, R, H, e),
        R = x1(176.4 * t.reduce( (U, N) => U + N[1], 0) * E | 0),
        [H,e,t,A,O] = A,
        j1(R, H, E, e, t, A, O),
        R.get())
    }
    let R1 = r => {
        let E = " " + r.toUpperCase()
          , R = 0
          , H = ""
          , A = (t, U) => {
            R += U,
            H += t
        }
          , O = 0;
        for (; R < E.length && O++ < 1e4; ) {
            var e = E[R];
            if (e !== "." || o(E, R + 1, 1))
                if (c(e, 2))
                    T1.some(t => t(E, R, A));
                else if (E1[e] !== 0) {
                    if (!c(e, M))
                        return !1;
                    B[e].some(t => t(E, R, A))
                } else
                    H += " ",
                    R++;
            else
                H += ".",
                R++
        }
        return H
    }
      , O1 = r1
      , I1 = (r, E) => {
        if ((r = r1(r, E)) === !1)
            return !1;
        var R = r
          , H = new Float32Array(R.length);
        for (let A = 0; A < R.length; A++)
            H[A] = (R[A] - 128) / 256;
        return H
    }
    ;
    function V(r) {
        let E = r || {}
          , R = (H, A) => A || E.phonetic ? H.toUpperCase() : R1(H);
        this.buf8 = (H, A) => O1(R(H, A), E),
        this.buf32 = (H, A) => I1(R(H, A), E),
        this.speak = (H, A) => {
            if (H = this.buf32(H, A),
            Z = Z === null ? new AudioContext : Z) {
                var O = Z
                  , e = H;
                let t, U = new Promise( (N, S) => {
                    let W = O.createBufferSource()
                      , I = O.createBuffer(1, e.length, 22050)
                      , D = I.getChannelData(0);
                    for (let l = 0; l < e.length; l++)
                        D[l] = e[l];
                    W.buffer = I,
                    W.connect(O.destination),
                    W.onended = () => {
                        N(!0)
                    }
                    ,
                    t = l => {
                        W.disconnect(),
                        S(l)
                    }
                    ,
                    W.start(0)
                }
                );
                return U.abort = t,
                U
            }
            throw new Error
        }
        ,
        this.download = (e, t) => {
            var O, e = this.buf8(e, t), t = new Blob([x(e)],{
                type: "audio/vnd.wave"
            }), t = (e = window.URL || window.webkitURL).createObjectURL(t);
            (O = document.createElement("a")).href = t,
            O.target = "_blank",
            O.download = "sam.wav",
            document.body.appendChild(O),
            O.click(),
            document.body.removeChild(O),
            e.revokeObjectURL(t)
        }
        ,
        this.wav = (H, A) => x(this.buf8(H, A))
    }
    V.buf8 = O1,
    V.buf32 = I1,
    V.convert = R1;
    return S1(_1);
}
)();
window.SamJs = __SamNS.default;

import SwiftUI

struct HomeView: View {
    @EnvironmentObject var store: AppStore
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            CheckInView()
                .tabItem {
                    Label("Check-in", systemImage: selectedTab == 0 ? "sun.max.fill" : "sun.max")
                }
                .tag(0)

            ChatView()
                .tabItem {
                    Label("Chat", systemImage: selectedTab == 1 ? "message.fill" : "message")
                }
                .tag(1)

            CopingStrategiesView()
                .tabItem {
                    Label("Toolkit", systemImage: selectedTab == 2 ? "heart.text.square.fill" : "heart.text.square")
                }
                .tag(2)
        }
        .tint(.brand)
    }
}

#Preview {
    HomeView().environmentObject(AppStore())
}

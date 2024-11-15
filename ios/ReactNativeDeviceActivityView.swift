import SwiftUI
import ExpoModulesCore
import FamilyControls
import UIKit
import Combine

// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
@available(iOS 15.0, *)
class ReactNativeDeviceActivityView: ExpoView {
    
    public let model = ScreenTimeSelectAppsModel()
    
    let contentView: UIHostingController<ScreenTimeSelectAppsContentView>
    
    private var cancellables = Set<AnyCancellable>()
    
    required init(appContext: AppContext? = nil) {
        contentView = UIHostingController(
            rootView: ScreenTimeSelectAppsContentView(
                model: model
            )
        )
        
        super.init(appContext: appContext)
        
        clipsToBounds = true
        
        self.addSubview(contentView.view)
        
        model.$activitySelection.sink { selection in
            if(selection != self.previousSelection){
                self.updateSelection(selection: selection)
                self.previousSelection = selection
            }
        }
        .store(in: &cancellables)
    }
    
    override func layoutSubviews() {
        contentView.view.frame = bounds
    }
    
    let onSelectionChange = EventDispatcher()
    
    var previousSelection: FamilyActivitySelection?
    
    func updateSelection(selection: FamilyActivitySelection) {
        let encoder = JSONEncoder()
        do {
            let json = try encoder.encode(selection)
            let jsonString = json.base64EncodedString()
            
            onSelectionChange([
                "familyActivitySelection": jsonString,
                "applicationCount": selection.applicationTokens.count,
                "categoryCount": selection.categoryTokens.count,
                "webDomainCount": selection.webDomainTokens.count,
                "categoryTokens": selection.categoryTokens.map({ token in
                    return "\(String(token.hashValue))"
                }),
                "applicationTokens": selection.applicationTokens.map({ token in
                    return "\(String(token.hashValue))"
                }),
                "webDomainTokens": selection.webDomainTokens.map({ token in
                    return "\(String(token.hashValue))"
                }),
                "categoryTokensCopy": selection.categoryTokens.map({ token in
                    return "\(String(token.hashValue))"
                }),
                "applicationTokensCopy": selection.applicationTokens.map({ token in
                    return "\(String(token.hashValue))"
                }),
                "webDomainTokensCopy": selection.webDomainTokens.map({ token in
                    return "\(String(token.hashValue))"
                }),
                "categoryTokensInt": selection.categoryTokens.map({ token in
                    return token.hashValue
                }),
                "applicationTokensInt": selection.applicationTokens.map({ token in
                    return token.hashValue
                }),
                "webDomainTokensInt": selection.webDomainTokens.map({ token in
                    return token.hashValue
                })
            ])
        } catch {
            
        }
        
        // model.saveSelection(selection: selection)
    }
}

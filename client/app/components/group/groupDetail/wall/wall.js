import angular from "angular";
import uiRouter from "@uirouter/angularjs";
import ngMaterial from "angular-material";
import GroupService from "services/group/group";
import wallComponent from "./wall.component";
import wallpost from "./_wallpost/wallpost";
import wallJoined from "./_wallJoined/wallJoined";

let wallModule = angular.module("wall", [
  uiRouter,
  ngMaterial,
  GroupService,
  wallpost,
  wallJoined
])

.component("wall", wallComponent)

.directive("wallScrollTop", () => {
  return {
    scope: {
      wallScrollTop: "="
    },
    link: (scope, elements) => {
      let el = elements[0];
      scope.$watchCollection("wallScrollTop", (newValue) => {
        if (newValue) el.scrollTop = 0;
      });
    }
  };
})

.filter("reverse", () => {
  return (items) => {
    return items.slice().reverse();
  };
})

.config(($stateProvider) => {
  "ngInject";
  $stateProvider
    .state("group.groupDetail.wall", {
      url: "/wall",
      component: "wall",
      resolve: {
        groupHistory: (HistoryService, $stateParams, $state) => {
          return HistoryService.list({ group: $stateParams.groupId })
            .catch(() => $state.go("login"));
        }
      },
      ncyBreadcrumb: {
        label: "{{'GROUP.CHAT' | translate}}"
      }
    });
})

.name;

export default wallModule;
